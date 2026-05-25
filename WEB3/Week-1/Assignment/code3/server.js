import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

import { runDoctorAsJson } from "./lib/doctor.js";
import { loadProgressPublic, toggleWeek } from "./lib/progress.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const PORT = 4242;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
};

function sendJson(res, statusCode, data) {
    const body = JSON.stringify(data);
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body),
    });
    res.end(body);
}

async function serveStaticFile(res, requestPath) {
    const relativePath = requestPath === "/" ? "/index.html" : requestPath;
    const filePath = join(PUBLIC_DIR, relativePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    try {
        const contents = await readFile(filePath);
        const mimeType = MIME_TYPES[extname(filePath)] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": mimeType });
        res.end(contents);
    } catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === "/api/progress" && req.method === "GET") {
        sendJson(res, 200, loadProgressPublic());
        return;
    }

    if (url.pathname.startsWith("/api/progress/") && req.method === "POST") {
        const weekStr = url.pathname.split("/").pop();
        const week = Number(weekStr);
        if (!Number.isInteger(week) || week < 1 || week > 42) {
            sendJson(res, 400, { error: `Invalid week: ${weekStr}` });
            return;
        }
        const updated = toggleWeek(week);
        sendJson(res, 200, updated);
        return;
    }

    if (url.pathname === "/api/doctor" && req.method === "GET") {
        const result = runDoctorAsJson();
        sendJson(res, 200, result);
        return;
    }

    if (url.pathname.startsWith("/api/")) {
        sendJson(res, 404, { error: "Unknown API route" });
        return;
    }

    await serveStaticFile(res, url.pathname);
});

server.listen(PORT, () => {
    console.log(`\nWeb3 Orientation Kit dashboard running at:`);
    console.log(`  http://localhost:${PORT}\n`);
});