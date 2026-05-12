# System Design - Basics (Interview Prep Guide).

> A complete, interview-style walkthrough of foundational System Design concepts — the level typically expected before diving into full "design Twitter/Uber" style rounds. Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to System Design](#1-introduction-to-system-design)
2. [Client-Server Architecture](#2-client-server-architecture)
3. [Scalability](#3-scalability)
4. [Load Balancing](#4-load-balancing)
5. [Caching](#5-caching)
6. [Databases at Scale](#6-databases-at-scale)
7. [Content Delivery Networks (CDN)](#7-content-delivery-networks-cdn)
8. [Message Queues & Asynchronous Processing](#8-message-queues--asynchronous-processing)
9. [Monolith vs Microservices](#9-monolith-vs-microservices)
10. [API Design Basics](#10-api-design-basics)
11. [Availability, Reliability & Fault Tolerance](#11-availability-reliability--fault-tolerance)
12. [Quick Revision Cheat Sheet](#12-quick-revision-cheat-sheet)

---

## 1. Introduction to System Design.

### What is System Design and why is it asked in interviews (even for non-senior roles)?

> System Design is the process of defining the architecture, components, and data flow of a software system to meet specific functional and non-functional requirements (like scale, reliability and performance). It's asked even at junior/mid levels because it reveals how you think about trade-offs and real-world constraints, not just whether you can write correct code — companies want to see you can reason about a system beyond a single function or class.

### What's the difference between High-Level Design (HLD) and Low-Level Design (LLD)?

> **HLD** describes the overall architecture — major components, how they communicate, and how data flows between them (e.g., "we'll have a web server, a cache, a database, and a queue").

> **LLD** zooms into the details of individual components — actual class structures, database schemas, API contracts, and algorithms used within a single service. HLD answers "what pieces do we need and how do they fit together"; LLD answers "how exactly is each piece built."

### What are Functional vs Non-Functional Requirements?

> **Functional requirements** describe _what_ the system should do (e.g., "users can post a tweet," "users can follow other users").

> **Non-functional requirements** describe _how well_ it should do it — scalability, availability, latency, consistency, security. Interviewers care a lot about non-functional requirements because they drive most of the interesting architectural decisions.

![System Design Basics Overview](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuLPjappKtO3TjMRqNxX6zL99Gqbbmt9T6b2YIt8p8lbs9_3lnabValDxT&s=10)

---

## 2. Client-Server Architecture.

### What is Client-Server Architecture?

> It's the foundational model where a **client** (browser, mobile app) sends requests and a **server** processes them and sends back responses. The client is typically responsible for presentation/interaction, while the server handles business logic, data storage and processing.

![Client-Server Model Diagram](https://www.enjoyalgorithms.com/static/system-design-1ea2dc05d7baf6c0525babda46772892.png)

### What is the difference between a Stateless and a Stateful server design?

> A **stateless** server doesn't retain any client-specific data between requests — every request must carry all the information needed to process it (e.g., a token).

> A **stateful** server remembers information about a client's session across requests. Stateless design is generally preferred at scale because it makes it trivial to route a client's request to _any_ server instance (no server needs to "remember" that client specifically), which is essential for horizontal scaling and load balancing.

### What is a Single Point of Failure (SPOF) and why should you avoid it?

> An SPOF is any single component whose failure would bring down the entire system (e.g., one database server with no replica, one load balancer with no backup). Good system design identifies and eliminates SPOFs through redundancy — running multiple instances of critical components so the system keeps working even if one fails.

---

## 3. Scalability.

### What is Scalability?

> Scalability is a system's ability to handle increasing load (more users, more data, more requests) by adding resources, without a significant drop in performance.

### What's the difference between Vertical Scaling and Horizontal Scaling?

> - **Vertical Scaling (Scale Up):** Adding more power to an existing machine (more CPU, RAM, faster disk). Simple, but has a hard ceiling (a single machine can only get so big) and creates a single point of failure.

> - **Horizontal Scaling (Scale Out):** Adding more machines and distributing load across them. More complex to set up (needs load balancing, data partitioning), but scales much further and improves fault tolerance since load is spread across many machines.

![Vertical vs Horizontal Scaling](https://miro.medium.com/v2/resize:fit:1400/1*6QXIzkckOcx2eXo9uEhWZw.png)

### Why is Horizontal Scaling generally preferred for large-scale systems despite being more complex?

> Because vertical scaling eventually hits a physical/hardware ceiling (there's a limit to how big one machine can get, and it gets exponentially more expensive), whereas horizontal scaling can theoretically keep growing by adding more commodity machines. It also naturally improves availability — if one of many servers fails, the rest keep serving traffic, whereas a single powerful vertically-scaled server failing takes the whole system down.

### What is the difference between Scalability and Performance?

> **Performance** is about how fast a system responds under a _given_ load (e.g., response time for 100 concurrent users).

> **Scalability** is about how well that performance holds up _as load increases_ (e.g., does response time stay reasonable when you go from 100 to 100,000 concurrent users). A system can have great performance at low load but poor scalability if it degrades badly as load grows.

---

## 4. Load Balancing

### What is a Load Balancer and why is it needed?

> A load balancer sits in front of multiple servers and distributes incoming traffic across them, so no single server gets overwhelmed. It's essential for horizontal scaling — without it, you'd have multiple servers but no way to intelligently spread requests between them.

![Load Balancer Architecture Diagram](https://developers.cloudflare.com/_astro/lb-ref-arch-4.OnwMof7d_11aC7L.svg)

### What are common Load Balancing algorithms?

> - **Round Robin:** Requests are distributed sequentially across servers in rotation
> - **Least Connections:** Sends the request to the server currently handling the fewest active connections
> - **IP Hash:** Uses a hash of the client's IP to consistently route them to the same server (useful for session stickiness)
> - **Weighted Round Robin:** Like round robin, but servers with more capacity get proportionally more requests

### What's the difference between a Layer 4 and Layer 7 Load Balancer?

> A **Layer 4** load balancer makes routing decisions based on network-level info (IP address, TCP/UDP port) without inspecting the actual request content — faster, but less flexible.

> A **Layer 7** load balancer operates at the application layer and can inspect the actual HTTP request (headers, URL path, cookies) to make smarter routing decisions (e.g., routing `/api/images` to one set of servers and `/api/users` to another).

### What is Health Checking in the context of Load Balancers?

> Load balancers periodically ping backend servers (via a health-check endpoint) to verify they're up and responsive. If a server fails a health check, the load balancer temporarily stops routing traffic to it, preventing users from being sent to a broken/overloaded instance.

---

## 5. Caching.

### What is Caching and why does it matter so much in system design?

> Caching stores frequently accessed data in a faster-access layer (usually in-memory, like Redis or Memcached) so future requests for the same data can be served quickly, without repeating expensive computation or hitting a slower database every time. It's one of the highest-leverage ways to improve performance and reduce load on backend systems.

![Cache-Aside Pattern](https://miro.medium.com/v2/resize:fit:1400/1*31YHLLLJZLniUbrPZQPZUA.png)

### What are the common Caching strategies?

> - **Cache-Aside (Lazy Loading):** Application checks the cache first; on a miss, it fetches from the database, then stores the result in the cache for next time
> - **Write-Through:** Every write goes to the cache _and_ the database at the same time, keeping them in sync immediately (slower writes, but cache is always fresh)
> - **Write-Back (Write-Behind):** Writes go to the cache first and are asynchronously flushed to the database later (fast writes, but risk of data loss if the cache fails before flushing)
> - **Read-Through:** The cache itself is responsible for loading data from the database on a miss, transparent to the application

### What is Cache Invalidation and why is it considered a hard problem?

> Cache invalidation is the process of removing or updating stale cached data once the underlying source data changes. It's famously tricky ("there are only two hard things in computer science: cache invalidation and naming things") because you need to balance freshness (users seeing up-to-date data) against performance (not constantly re-fetching from the source) — get it wrong, and users either see stale data or you lose most of the caching benefit.

### What is a Cache Eviction Policy? Name a few common ones.

> Since cache memory is limited, an eviction policy decides what to remove when the cache is full and new data needs to be added:
>
> - **LRU (Least Recently Used):** Evict the item that hasn't been accessed for the longest time
> - **LFU (Least Frequently Used):** Evict the item accessed the fewest number of times
> - **FIFO:** Evict the oldest item added, regardless of usage

---

## 6. Databases at Scale.

### What is Database Replication and why is it used?

> Replication means keeping copies of the same data on multiple database servers. It's used to improve **read scalability** (reads can be spread across multiple replicas), **availability** (if the primary fails, a replica can take over), and **disaster recovery**.

![Database Replication & Sharding](https://media.geeksforgeeks.org/wp-content/uploads/20260114163512510798/database_sharding.webp)

### What's the difference between Master-Slave (Primary-Replica) and Master-Master Replication?

> In **Primary-Replica**, one server (primary) handles all writes, and one or more replicas handle reads, syncing data from the primary.

> In **Master-Master**, multiple servers can accept writes, and changes are synced between them — more complex, since it requires resolving conflicts when the same data is written differently on two masters at once.

### What is Database Sharding?

> Sharding is splitting a large database into smaller, independent pieces ("shards"), each holding a subset of the data (e.g., users A-M on one shard, N-Z on another), usually based on a **shard key**. It's used to scale writes horizontally — since no single database server has to hold or process all the data, each shard can be on its own machine.

### What's the difference between Replication and Sharding?

> **Replication** copies the _same_ full dataset across multiple servers (mainly for read scaling & availability).

> **Sharding** splits the dataset into _different_ pieces across multiple servers (mainly for write scaling & storage capacity). In large-scale systems, both are often used together — each shard might itself be replicated for redundancy.

### What is Database Denormalization used for at scale?

> At scale, denormalizing (deliberately duplicating some data instead of always normalizing/joining) reduces the number of expensive joins needed at read time, which matters a lot when a single query might otherwise need to hit multiple sharded/distributed tables — trading some storage and write-time complexity for much faster reads.

---

## 7. Content Delivery Networks (CDN).

### What is a CDN and why is it used?

> A CDN is a geographically distributed network of servers that cache and serve static content (images, videos, CSS, JS files) from a location physically closer to the end user, rather than from the origin server every time. This drastically reduces latency and offloads traffic from the origin server.

![How a CDN Works](https://media.geeksforgeeks.org/wp-content/uploads/20260114170023021350/_content_delivery_network.webp)

### What's the difference between a Push CDN and a Pull CDN?

> In a **push CDN**, you (the developer) proactively upload content to the CDN's servers ahead of time.

> In a **pull CDN**, the CDN automatically fetches and caches content from your origin server the first time it's requested, then serves cached copies for subsequent requests until the cache expires. Pull CDNs are more common today since they require less manual management.

### Would you use a CDN for dynamic, personalized content (like a user's account dashboard)?

> Generally no — CDNs are best suited for content that's the same for all/most users (static assets, public images, videos). Highly personalized or frequently changing content usually needs to be served directly from the origin (or use more advanced edge-computing/dynamic-caching strategies), since caching something unique-per-user provides little benefit and adds complexity.

---

## 8. Message Queues & Asynchronous Processing.

### What is a Message Queue and why would you introduce one into a system?

> A message queue is a component that lets services communicate **asynchronously** — a "producer" sends a message onto the queue, and a "consumer" picks it up and processes it whenever it's ready, without the producer needing to wait for an immediate response. It's used to decouple services, smooth out traffic spikes, and handle slow/long-running tasks without blocking the user-facing request.

![Message Queues & Event-Driven Architecture](https://www.automq.com/blog/event-streaming-vs-message-queuing-differences-amp-comparison-/1.webp)

### Can you give a real example of when you'd use a message queue?

> When a user uploads a video, you don't want them to wait (blocking) while the server transcodes it into multiple resolutions — that could take minutes. Instead, the upload request quickly pushes a "process this video" message onto a queue and immediately responds to the user ("upload received, processing"), while a separate worker service consumes that message and does the heavy transcoding work in the background, later notifying the user when it's done.

### What's the difference between a Message Queue and a Pub/Sub system?

> In a classic **message queue**, each message is typically consumed by exactly **one** consumer (once processed, it's removed from the queue) — good for distributing work across a pool of workers.

> In a **Pub/Sub (Publish-Subscribe)** system, a message published to a "topic" can be delivered to **multiple** subscribers simultaneously — good for broadcasting an event to many independent services that all need to react to it.

### What problem does Asynchronous Processing solve that synchronous request-response can't handle well?

> It prevents slow or resource-intensive tasks from blocking the user-facing request/response cycle, improving perceived responsiveness and letting the system absorb traffic spikes (since the queue acts as a buffer) instead of every request needing to be fully processed the instant it arrives.

---

## 9. Monolith vs Microservices.

### What is a Monolithic Architecture?

> A monolith is a single, unified application where all the functionality (UI, business logic, data access) is built and deployed as one codebase/unit. It's simpler to develop and deploy initially, but as it grows, it can become harder to scale specific parts independently or make changes without risking the whole system.

![Monolith vs Microservices](https://softwebsolutions.b-cdn.net/wp-content/uploads/2023/01/Monolithic-vs-Microservice.jpg)

### What is Microservices Architecture?

> An architecture where the application is broken into small, independent services, each responsible for a specific business capability (e.g., a separate "User Service," "Payment Service," "Notification Service"), communicating with each other typically over APIs or message queues. Each service can be developed, deployed, and scaled independently.

### What are the trade-offs between Monolith and Microservices?

> |                        | Monolith                                 | Microservices                                                   |
> | ---------------------- | ---------------------------------------- | --------------------------------------------------------------- |
> | Simplicity             | Simpler to build & deploy initially      | More operational complexity (many services to manage)           |
> | Scaling                | Must scale the whole app together        | Can scale individual services independently                     |
> | Development            | Easier for small teams                   | Better for large teams working on separate services in parallel |
> | Failure impact         | A bug can bring down the whole app       | A failure in one service can be isolated (with proper design)   |
> | Communication overhead | None (function calls within one process) | Network calls between services add latency & failure points     |

### When would you actually recommend starting with a Monolith over Microservices?

> For most new products/startups, especially early on — microservices add significant infrastructure and coordination overhead (service discovery, distributed tracing, network reliability) that isn't worth it until you actually have scaling or team-size problems that a monolith can't solve. A common piece of advice: "start with a monolith, break it into microservices once you feel real pain points," rather than over-engineering upfront.

---

## 10. API Design Basics.

### What makes a good API design, at a high level?

> A good API is **consistent** (predictable naming/structure), well-documented, versioned (so changes don't break existing consumers), secure (proper authentication/authorization), and returns clear, meaningful error messages/status codes.

### What is API Versioning and why is it necessary?

> Versioning (e.g., `/api/v1/users`, `/api/v2/users`) lets you evolve and improve an API over time without breaking existing clients that depend on the older behavior. Common approaches: URL path versioning, query parameter versioning, or custom headers.

### What is Rate Limiting and why do APIs implement it?

> Rate limiting restricts how many requests a client can make within a given time window (e.g., 100 requests/minute), protecting the system from abuse, accidental overload from buggy clients, and ensuring fair resource usage across all consumers of the API.

### What is Idempotency and why does it matter in API design?

> An operation is **idempotent** if performing it multiple times has the same effect as performing it once (e.g., `PUT /users/5` setting the same data repeatedly). This matters a lot for reliability — if a client doesn't receive a response due to a network issue and retries the request, an idempotent API ensures that retry doesn't cause unintended duplicate effects (e.g., charging a customer twice).

---

## 11. Availability, Reliability & Fault Tolerance.

### What is the difference between Availability and Reliability?

> **Availability** measures whether the system is up and responsive _right now_ (often expressed as a percentage of uptime, like "99.9% availability").

> **Reliability** measures whether the system consistently performs its intended function _correctly_ over time, without failures — a system can be available (responding to requests) but unreliable (giving wrong/inconsistent answers).

### What does "Five Nines" (99.999%) availability mean in practice?

> It refers to a system being up 99.999% of the time, which translates to only about **5 minutes of downtime per year** — an extremely high bar that requires serious redundancy, failover mechanisms, and operational rigor to achieve.

### What is Fault Tolerance and how is it achieved?

> Fault tolerance is a system's ability to keep operating correctly even when some component fails. It's typically achieved through **redundancy** (multiple instances of critical components), **replication** (multiple copies of data), **failover mechanisms** (automatically switching to a backup when the primary fails), and designing for **graceful degradation** (the system still provides partial/reduced functionality instead of failing completely).

### What is the CAP Theorem and why does it matter for System Design?

> In any distributed system, you can only fully guarantee **two** of the following three at the same time: **Consistency** (every read gets the latest write), **Availability** (every request gets a response), and **Partition Tolerance** (the system keeps working despite network failures between nodes). Since network partitions are unavoidable in real distributed systems, in practice this becomes a trade-off between **Consistency and Availability** — a decision you'll be asked to justify in almost any system design interview.

---

## 12. Quick Revision Cheat Sheet

| Topic                          | One-line takeaway                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| HLD vs LLD                     | HLD = overall architecture; LLD = detailed component design                         |
| Horizontal vs Vertical Scaling | Horizontal = more machines; Vertical = bigger machine                               |
| Load Balancer                  | Distributes traffic across servers (Round Robin, Least Connections, IP Hash)        |
| Caching                        | Speeds up reads (Cache-Aside, Write-Through, Write-Back)                            |
| Replication                    | Copies of the same data for read scaling & availability                             |
| Sharding                       | Splits data across servers for write scaling & storage                              |
| CDN                            | Serves static content from servers near the user for lower latency                  |
| Message Queue                  | Enables async, decoupled communication between services                             |
| Monolith vs Microservices      | Simplicity vs independent scalability/deployment trade-off                          |
| Idempotency                    | Repeating the same request has the same effect as doing it once                     |
| CAP Theorem                    | Distributed systems trade off Consistency vs Availability under Partition Tolerance |

---
