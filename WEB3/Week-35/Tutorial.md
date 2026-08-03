# Tutorial: A Local Graph Node and the Graph CLI.

This week's tooling is genuinely heavier than anything so far.

Not one new package, but a small local infrastructure stack (a Graph Node, IPFS and Postgres, run together via Docker Compose) plus a CLI that compiles mapping code to WebAssembly.

Worth the extra setup care that implies.

## 1. Confirm Docker is installed.

```
docker --version
docker compose version
```

---

## 2. Set up a local Graph Node.

- Go to [The Graph's](https://github.com/graphprotocol/graph-node) official GitHub repository.

- Look for the Docker directory.

  ```
  graph-node/
  └── docker/
      └── docker-compose.yml
  ```

- Open that official `docker-compose.yml` and use it as your starting point.

- Check the project's official documentation for any required changes, such as:
  - RPC URL
  - network (sepolia)
  - image versions
  - environment variables

- Create a `docker-compose.yml` file into your project:

  ```
  Week-35/
  └── docker-compose.yml
  ```

Now mirroring the official reference file, pointed at Sepolia (the same network every previous week's own live deployments have used):

```yaml
services:
  graph-node:
    image: graphprotocol/graph-node
    ports:
      - "8000:8000"
      - "8001:8001"
      - "8020:8020"
      - "8030:8030"
      - "8040:8040"
    depends_on:
      - ipfs
      - postgres

    extra_hosts:
      - "host.docker.internal:host-gateway"

    environment:
      postgres_host: postgres
      postgres_user: graph-node
      postgres_pass: let-me-in
      postgres_db: graph-node

      ipfs: "ipfs:5001"

      ethereum: "sepolia:https://ethereum-sepolia-rpc.publicnode.com"

      GRAPH_LOG: info

  ipfs:
    image: ipfs/kubo:v0.17.0
    ports:
      - "5001:5001"
    volumes:
      - ./data/ipfs:/data/ipfs:Z

  postgres:
    image: postgres
    ports:
      - "5432:5432"
    command:
      [
        "postgres",
        "-cshared_preload_libraries=pg_stat_statements",
        "-cmax_connections=200",
      ]
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
      PGDATA: "/var/lib/postgresql/data"
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"

    volumes:
      - ./data/postgres:/var/lib/postgresql/data:Z
```

```
<!-- Pull the images -->
docker compose pull

<!-- Then start Graph node -->
docker compose up
```

This is real, multi-container infrastructure, worth double-checking against the current official `graph-node` repository's own reference compose file before relying on it long-term.

Docker image tags and exact environment variable names do shift over time, more than most single-binary tools this course has installed so far.

---

## 3. Install the Graph CLI. (current as of this week)

```
npm install -g @graphprotocol/graph-cli@latest
graph --version
```

---

## 4. If Docker isn't available, or feels like more setup than this week's own learning goals justify.

Every assignment below can alternatively deploy straight to Subgraph Studio (Concept 8 covers exactly what that is) instead of a local Graph Node.

No Docker, no local infrastructure at all, at the cost of needing a free Studio account and losing the ability to iterate fully offline.

Hard's own assignment uses Studio regardless, for its own final, real deployment.

Easy and Medium default to the local Docker setup specifically so most of a subgraph's own development loop can happen without needing an account at all.

---
