import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  createGenesisBlock,
  mineNextBlock,
  isChainValid,
  type Block,
} from "./chain.js";

const PORT = Number(process.env.PORT ?? 5001);
const PEERS = (process.env.PEERS ?? "")
  .split(",")
  .map((peer) => peer.trim())
  .filter(Boolean);
const DIFFICULTY = Number(process.env.DIFFICULTY ?? 3);

let localChain: Block[] = [createGenesisBlock(DIFFICULTY).block];

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8") || "{}";
        resolve(JSON.parse(body) as T);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function broadcastChain(chain: Block[]): Promise<void> {
  await Promise.all(
    PEERS.map(async (peer) => {
      try {
        await fetch(`${peer}/receive-chain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chain }),
        });
      } catch (err) {
        console.warn(`Could not reach peer ${peer}: ${(err as Error).message}`);
      }
    }),
  );
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/chain" && req.method === "GET") {
    sendJson(res, 200, { length: localChain.length, chain: localChain });
    return;
  }

  if (url.pathname === "/mine" && req.method === "POST") {
    const body = await readJsonBody<{ data: string }>(req);
    const result = mineNextBlock(
      localChain[localChain.length - 1],
      body.data,
      DIFFICULTY,
    );
    localChain = [...localChain, result.block];
    await broadcastChain(localChain);
    sendJson(res, 200, {
      minedBlock: result.block,
      attempts: result.attempts,
      chainLength: localChain.length,
    });
    return;
  }

  if (url.pathname === "/receive-chain" && req.method === "POST") {
    const body = await readJsonBody<{ chain: Block[] }>(req);
    const incoming = body.chain;

    if (!isChainValid(incoming, DIFFICULTY)) {
      sendJson(res, 400, {
        accepted: false,
        reason: "incoming chain failed validation",
      });
      return;
    }
    if (incoming.length <= localChain.length) {
      sendJson(res, 200, {
        accepted: false,
        reason: `incoming chain (${incoming.length} blocks) is not longer than local chain (${localChain.length} blocks)`,
      });
      return;
    }

    localChain = incoming;
    sendJson(res, 200, {
      accepted: true,
      reason: `replaced local chain with a longer valid chain (${incoming.length} blocks)`,
    });
    return;
  }

  sendJson(res, 404, { error: "Unknown route" });
});

server.listen(PORT, () => {
  console.log(`Node listening on port ${PORT}`);
  console.log(
    `Peers: ${PEERS.length > 0 ? PEERS.join(", ") : "(none configured)"}`,
  );
  console.log(`Difficulty: ${DIFFICULTY}\n`);
});
