# Computer Networks. (Interview Prep Guide)

> A complete, interview-style walkthrough of Computer Networks fundamentals. With extra emphasis on the topics that matter most for Web Dev roles (HTTP, DNS, TLS). Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to Computer Networks](#1-introduction-to-computer-networks)
2. [OSI Model](#2-osi-model)
3. [TCP/IP Model](#3-tcpip-model)
4. [TCP vs UDP](#4-tcp-vs-udp)
5. [IP Addressing & Subnetting](#5-ip-addressing--subnetting)
6. [DNS (Domain Name System)](#6-dns-domain-name-system)
7. [HTTP / HTTPS](#7-http--https)
8. [TLS / SSL & Security](#8-tls--ssl--security)
9. [Routing & Switching](#9-routing--switching)
10. [Network Devices & Topologies](#10-network-devices--topologies)
11. [Congestion Control & Error Handling](#11-congestion-control--error-handling)
12. [Quick Revision Cheat Sheet](#12-quick-revision-cheat-sheet)

---

## 1. Introduction to Computer Networks.

### What is a Computer Network?

> A computer network is a collection of interconnected devices (computers, servers, routers, phones) that can communicate and share resources/data with each other using a common set of rules called **protocols**.

### What's the difference between LAN, MAN and WAN?

> - **LAN (Local Area Network):** Covers a small area like a home, office or building — high speed, low latency (e.g., office Wi-Fi)
> - **MAN (Metropolitan Area Network):** Spans a city or large campus — connects multiple LANs
> - **WAN (Wide Area Network):** Spans large geographical areas, even countries/continents — the internet itself is the largest WAN

### What is bandwidth vs latency vs throughput?

> - **Bandwidth:** The maximum theoretical data transfer capacity of a connection (e.g., 100 Mbps)
> - **Latency:** The time delay for data to travel from source to destination (usually measured in ms) — matters a lot for real-time apps
> - **Throughput:** The actual amount of data successfully transferred in practice, which is often lower than bandwidth due to overhead, congestion, or errors

### What is a Protocol?

> A protocol is an agreed-upon set of rules that defines how data is formatted, transmitted and interpreted between devices — e.g., HTTP for web pages, TCP for reliable delivery, DNS for name resolution. Without shared protocols, devices from different vendors couldn't understand each other.

![Computer Network Basics](https://media.geeksforgeeks.org/wp-content/uploads/20250726184452563578/frame_25.webp)

---

## 2. OSI Model.

### What is the OSI Model and why do we need it?

> The OSI (Open Systems Interconnection) Model is a conceptual 7-layer framework that standardizes how different networking systems communicate, breaking the process into layers so each layer only needs to worry about its own job, communicating with the layer directly above/below it. It's mostly used as a teaching/reference model today rather than something literally implemented layer-by-layer.

![OSI Model 7 Layers](https://coderepublics.com/blog/wp-content/uploads/2023/09/WHAT-IS-OSI-MODEL-7-LAYERS-EXPLAINED.jpg)

### Can you name and briefly explain all 7 layers of the OSI model?

> (Mnemonic: "**P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way" — bottom to top)

> 1. **Physical:** Raw bits over a physical medium (cables, radio signals, voltages)
> 2. **Data Link:** Node-to-node delivery, MAC addresses, frames, error detection on a single link (e.g., Ethernet)
> 3. **Network:** Logical addressing (IP) and routing packets across multiple networks
> 4. **Transport:** End-to-end delivery, reliability, flow control (TCP/UDP)
> 5. **Session:** Establishes, manages, and terminates sessions/connections between applications
> 6. **Presentation:** Data translation, encryption, compression (e.g., converting to a common format)
> 7. **Application:** Closest to the end user — this is where HTTP, FTP, SMTP, DNS operate

### Which OSI layer does a Router operate at? What about a Switch?

> A **Router** operates at the **Network layer (Layer 3)**, using IP addresses to route packets between networks.

> A traditional **Switch** operates at the **Data Link layer (Layer 2)**, using MAC addresses to forward frames within the same network.

---

## 3. TCP/IP Model.

### What is the TCP/IP Model, and how does it differ from OSI?

> The TCP/IP model is the practical, 4-layer model that the actual internet is built on (OSI is more theoretical). It condenses OSI's 7 layers into 4:
>
> - **Network Access (Link)** : Combines OSI's Physical + Data Link
> - **Internet** : Equivalent to OSI's Network layer (IP lives here)
> - **Transport** : Same as OSI's Transport layer (TCP/UDP)
> - **Application** : Combines OSI's Session + Presentation + Application

![OSI vs TCP/IP Model](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXw9tml9rlb0k25IOANWveCjT7jMQ35_G6-4XXm2KiKZI71emsesbU1BaF&s=10)

### Why does the industry mostly talk about TCP/IP rather than OSI in practice?

> Because TCP/IP is what the actual internet protocol suite implements and was built on — OSI was designed as a universal standard but was never fully adopted as-is. OSI remains useful as a teaching tool for reasoning about where a given protocol or issue "lives," but real-world troubleshooting and system design map to TCP/IP's 4 layers.

---

## 4. TCP vs UDP.

### What's the difference between TCP and UDP?

> |             | TCP                                                                  | UDP                                                                                                |
> | ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
> | Connection  | Connection-oriented (handshake required)                             | Connectionless                                                                                     |
> | Reliability | Reliable — guarantees delivery, order, retransmits lost packets      | Unreliable — no guarantee of delivery or order                                                     |
> | Speed       | Slower (due to overhead of guarantees)                               | Faster (minimal overhead)                                                                          |
> | Use cases   | Web browsing, email, file transfer — anywhere data integrity matters | Video/voice calls, live streaming, DNS, gaming — anywhere speed matters more than perfect delivery |

### Can you explain the TCP Three-Way Handshake?

> It's how a TCP connection is established before any data is sent:
>
> 1. **SYN:** Client sends a SYN (synchronize) packet to the server, proposing to start a connection
> 2. **SYN-ACK:** Server responds with SYN-ACK, acknowledging the client's request and proposing its own sync
> 3. **ACK:** Client sends back an ACK, confirming — connection is now established and data transfer can begin

![TCP 3-Way Handshake](https://networkwalks.com/wp-content/uploads/2020/10/TCP-three-way-handshake-process-1-1.png)

### How does TCP close a connection?

> Using a **four-way handshake** (sometimes optimized to three steps): each side sends a **FIN** (finish) packet and receives an **ACK** for it, since TCP connections are full-duplex and both directions need to be closed independently.

### Why is UDP used for DNS and video streaming instead of TCP?

> For DNS, queries are small and typically don't need TCP's connection setup overhead — speed matters more and if a query is lost, the client just retries.

> For video/voice streaming, a dropped or late packet (e.g., one video frame) is less noticeable than the added lag/stutter that TCP's retransmission and ordering guarantees would introduce — it's better to skip the lost data and keep playing in real time.

---

## 5. IP Addressing & Subnetting.

### What is an IP Address and what's the difference between IPv4 and IPv6?

> An IP address uniquely identifies a device on a network. **IPv4** is a 32-bit address (e.g., `192.168.1.1`), giving about 4.3 billion possible addresses — which have run out given the number of internet-connected devices today.

> **IPv6** is a 128-bit address (e.g., `2001:0db8::1`), providing a vastly larger address space designed to solve IPv4 exhaustion.

![IP Addressing & Classes](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4blS5Yvjoo1DrnMN38Ny5zZBrDHz99NPehPDkJ5DvMc8WZ_uUTg6_dmA&s=10)

### What's the difference between a Public IP and a Private IP?

> A **public IP** is globally unique and routable on the internet, assigned by an ISP. A **private IP** (e.g., ranges like `192.168.x.x`, `10.x.x.x`) is only valid within a local/private network and isn't directly reachable from the internet — devices on a private network share a public IP via **NAT** (Network Address Translation) to access the internet.

### What is Subnetting and why is it used?

> Subnetting is the process of dividing a large network into smaller sub-networks ("subnets"), using a **subnet mask** to separate the network portion of an IP address from the host portion. It's used to improve network organization, reduce broadcast traffic, and use IP address ranges more efficiently.

### What is a MAC Address and how is it different from an IP address?

> A **MAC (Media Access Control) address** is a physical, hardware-burned-in identifier for a network interface (e.g., `00:1A:2B:3C:4D:5E`) — used for Layer 2 communication within a local network. An **IP address** is a logical address assigned by software/network configuration, used for Layer 3 routing across networks. MAC addresses are generally fixed to the hardware; IP addresses can change based on which network you're connected to.

### What is NAT (Network Address Translation)?

> NAT allows multiple devices on a private network to share a single public IP address when accessing the internet. The router keeps a translation table mapping internal private IP+port combos to the shared public IP+port, so responses can be routed back to the correct internal device.

---

## 6. DNS (Domain Name System).

### What is DNS and why do we need it?

> DNS translates human-readable domain names (like `google.com`) into machine-readable IP addresses. It exists because humans are much better at remembering names than strings of numbers, and it allows a domain's underlying IP address to change without users needing to know or care.

![How DNS Resolution Works](https://cdn.bunny.pictures/images/what-is-dns-and-how-does-it-work.svg)

### Can you walk through what happens step-by-step when you type a URL and hit Enter?

> (High level, this is one of the most commonly asked web dev networking questions):

> 1. Browser checks its **cache** for a recent DNS lookup of that domain
> 2. If not cached, it queries a **DNS resolver** (usually provided by your ISP)
> 3. The resolver queries a **Root DNS server**, which points to the right **TLD server** (e.g., `.com`)
> 4. The TLD server points to the domain's **Authoritative DNS server**, which returns the actual IP address
> 5. Browser establishes a **TCP connection** to that IP (port 80/443)
> 6. If HTTPS, a **TLS handshake** happens to establish a secure channel
> 7. Browser sends an **HTTP request**; server responds with the requested resource (HTML, etc.)
> 8. Browser parses the HTML, requests additional assets (CSS, JS, images), and renders the page

### What are the different types of DNS records?

> - **A record:** Maps a domain to an IPv4 address
> - **AAAA record:** Maps a domain to an IPv6 address
> - **CNAME record:** Maps a domain/subdomain to another domain name (an alias)
> - **MX record:** Specifies the mail server responsible for a domain
> - **TXT record:** Holds arbitrary text, often used for verification or SPF/DKIM email security
> - **NS record:** Specifies the authoritative name servers for a domain

### What's the difference between a Recursive DNS Resolver and an Authoritative DNS Server?

> A **recursive resolver** does the legwork on behalf of the client, it queries multiple DNS servers step by step until it finds the answer, then caches and returns it.

> The **authoritative server** is the final source of truth for a specific domain's records, it doesn't ask anyone else, it just answers directly from its own zone data.

---

## 7. HTTP / HTTPS.

### What is HTTP and is it stateless or stateful?

> HTTP (HyperText Transfer Protocol) is the application-layer protocol used for transferring web content between client and server. It's **stateless** — each request is independent and the server doesn't inherently remember previous requests from the same client. This is why mechanisms like **cookies**, **sessions** and **tokens (JWT)** exist — to maintain state across requests on top of a stateless protocol.

![HTTP Request/Response Cycle](https://media.geeksforgeeks.org/wp-content/uploads/20250705152348042640/Request-and-Response-Cycle.webp)

### What's the difference between HTTP and HTTPS?

> HTTPS is HTTP layered on top of **TLS/SSL encryption**. It encrypts the data in transit (so it can't be read or tampered with by anyone intercepting it) and it verifies the server's identity via a certificate — HTTP sends everything in plain text, which is vulnerable to eavesdropping and man-in-the-middle attacks.

### What are the common HTTP methods and when would you use each?

> - **GET** : Retrieve data, no side effects, safe to cache/repeat
> - **POST** : Submit new data / create a resource
> - **PUT** : Update/replace a resource entirely (idempotent — repeating it has the same effect)
> - **PATCH** : Partially update a resource
> - **DELETE** : Remove a resource
> - **HEAD** : Like GET but returns only headers, no body (useful for checking if a resource exists)

### What's the difference between PUT and PATCH?

> `PUT` replaces the _entire_ resource with the new data provided (missing fields might get wiped/reset).

> `PATCH` applies a _partial_ update, only modifying the specific fields sent, leaving the rest untouched.

### What are common HTTP status code categories?

> - **1xx** – Informational (e.g., 100 Continue)
> - **2xx** – Success (200 OK, 201 Created, 204 No Content)
> - **3xx** – Redirection (301 Moved Permanently, 302 Found, 304 Not Modified)
> - **4xx** – Client Error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
> - **5xx** – Server Error (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)

### What's the difference between 401 Unauthorized and 403 Forbidden?

> **401** means the request lacks valid authentication credentials — you need to log in / provide a valid token.

> **403** means you _are_ authenticated, but you don't have permission to access this particular resource.

### What are Cookies and what's the difference between Cookies, Sessions and Tokens (JWT)?

> A **cookie** is a small piece of data the server sends to the browser, which the browser then automatically attaches to future requests to the same domain.

> A **session** typically stores user state server-side, with the client only holding a session ID (usually in a cookie) to reference it.

> A **JWT (JSON Web Token)** is a self-contained, signed token holding the user's claims/data directly — the server doesn't need to store session state, since the token itself can be verified using a signature (stateless auth).

### What is CORS and why does it exist?

> CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a domain different from the one that served the page, unless that other domain explicitly allows it via response headers (like `Access-Control-Allow-Origin`). It exists to prevent malicious sites from silently making authenticated requests to other sites on a user's behalf.

### What's the difference between HTTP/1.1, HTTP/2 and HTTP/3?

> **HTTP/1.1** processes requests mostly one at a time per connection (or with limited pipelining), causing "head-of-line blocking."

> **HTTP/2** introduced multiplexing (multiple requests/responses over a single connection simultaneously), header compression, and server push.

> **HTTP/3** replaces TCP with **QUIC** (built on UDP), removing TCP-level head-of-line blocking entirely and improving performance especially on unreliable networks.

---

## 8. TLS / SSL & Security

### What is TLS, and how is it different from SSL?

> TLS (Transport Layer Security) is the modern protocol used to encrypt data between client and server; SSL (Secure Sockets Layer) is its predecessor and is now considered outdated/insecure. In casual conversation "SSL" is often still used to refer to what is technically TLS today.

![SSL/TLS Handshake Process](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00NDEzMjA4LVlBelZKWg?revision=2)

### Can you walk through the TLS Handshake at a high level?

> 1. **Client Hello:** Client sends supported TLS versions, cipher suites, and a random value
> 2. **Server Hello:** Server picks a cipher suite, sends its **digital certificate** (containing its public key) and its own random value
> 3. **Key Exchange:** Client verifies the certificate against trusted Certificate Authorities, then both sides derive a shared **symmetric session key** (e.g., via Diffie-Hellman)
> 4. **Finished:** Both sides confirm and all further communication is encrypted using the fast symmetric session key

### Why does TLS use both asymmetric and symmetric encryption instead of just one?

> **Asymmetric encryption** (public/private key pairs) is used only briefly during the handshake to safely exchange/agree on a key, since it's secure even over an unencrypted channel but is computationally expensive.

> Once a shared secret is established, both sides switch to **symmetric encryption** (much faster) for the actual bulk data transfer — getting the security benefits of asymmetric crypto without its performance cost.

### What is a Digital Certificate and what is a Certificate Authority (CA)?

> A digital certificate is an electronic document that binds a public key to an identity (e.g., a domain name), digitally signed by a trusted third party.

> A **Certificate Authority** is that trusted third party (e.g., Let's Encrypt, DigiCert) that verifies the domain owner's identity and issues the certificate — browsers trust a certificate because they trust the CA that signed it.

### What's the difference between Symmetric and Asymmetric encryption?

> **Symmetric encryption** uses the same key to encrypt and decrypt — fast, but the key must be securely shared beforehand.

> **Asymmetric encryption** uses a key pair (public key to encrypt, private key to decrypt, or vice versa for signing) — no need to share a secret key in advance, but it's significantly slower, so it's typically used only for key exchange or signing, not bulk data.

---

## 9. Routing & Switching.

### What is Routing and how does a router decide where to send a packet?

> Routing is the process of selecting a path for data to travel across networks. A router examines a packet's destination IP address and consults its **routing table** to determine the best next hop, forwarding the packet accordingly — this repeats hop by hop until the packet reaches its destination network.

### What's the difference between Static and Dynamic Routing?

> **Static routing** uses manually configured, fixed routes — simple and predictable, but doesn't adapt to network changes/failures.

> **Dynamic routing** uses protocols (like OSPF, BGP, RIP) that let routers automatically discover and adapt routes based on current network conditions.

### What is BGP and why is it important for the internet?

> BGP (Border Gateway Protocol) is the protocol that determines how data is routed _between_ large networks (Autonomous Systems) across the internet — it's essentially the routing protocol that holds the entire global internet together, allowing ISPs and large networks to exchange routing information.

### What's the difference between a Switch, Router, Hub and Bridge?

> - **Hub:** Dumbest device, broadcasts incoming data to _all_ ports, no intelligence (largely obsolete)
> - **Switch:** Operates at Layer 2, uses MAC addresses to forward data only to the intended device on the same network
> - **Bridge:** Connects and filters traffic between two network segments, also using MAC addresses
> - **Router:** Operates at Layer 3, connects different networks together and routes data based on IP addresses

---

## 10. Network Devices & Topologies.

### What are the common Network Topologies?

> - **Bus:** All devices share a single central cable, simple but a single break disrupts everyone
> - **Star:** All devices connect to a central hub/switch, easy to manage, but the central device is a single point of failure
> - **Ring:** Each device connects to exactly two others, forming a loop that let's data travels around the ring
> - **Mesh:** Every device connects to every other device making highly redundant/fault-tolerant, but expensive and complex to wire

![Common-Network-Topologies](https://www.zenarmor.com/docs/network-topology-types.png)

### What is a Proxy Server and what's the difference between a Forward Proxy and a Reverse Proxy?

> A proxy server acts as an intermediary for requests. A **forward proxy** sits in front of clients, forwarding their requests to the internet on their behalf (used for anonymity, content filtering, caching).

> A **reverse proxy** sits in front of servers, receiving client requests and forwarding them to the appropriate backend server (used for load balancing, SSL termination, caching, hiding backend infrastructure — e.g., Nginx, Cloudflare).

### What is a Load Balancer and why is it needed?

> A load balancer distributes incoming traffic across multiple backend servers, preventing any single server from becoming overwhelmed. It improves availability (if one server goes down, traffic is redirected to healthy ones) and scalability (more servers can be added behind it as demand grows).

### What is a Firewall?

> A firewall is a security system (hardware or software) that monitors and controls incoming/outgoing network traffic based on predefined security rules, acting as a barrier between a trusted internal network and untrusted external networks (like the internet).

---

## 11. Congestion Control & Error Handling.

### What is Congestion Control in TCP?

> It's a set of mechanisms TCP uses to avoid overwhelming the network with too much data, dynamically adjusting how much data is sent based on current network conditions.

> Key mechanisms: **Slow Start** (start small, grow exponentially until packet loss is detected), **Congestion Avoidance** (grow more conservatively after that) and reacting to packet loss as a signal to slow down.

### What's the difference between Flow Control and Congestion Control?

> **Flow control** prevents a fast sender from overwhelming a _slow receiver_ (managed via the receiver's buffer/window size — this is about the two endpoints).

> **Congestion control** prevents overwhelming the _network itself_ (routers/links in between) — this is about the overall path, not just the two endpoints.

### How does TCP guarantee reliable delivery?

> Using **sequence numbers** (to reorder packets and detect gaps), **acknowledgments (ACKs)** (receiver confirms what it has received), **retransmission** (sender resends anything not acknowledged within a timeout) and **checksums** (to detect corrupted data).

### What is Error Detection vs Error Correction?

> **Error detection** (e.g., checksums, CRC) identifies that data got corrupted during transmission, but doesn't fix it. The receiver just knows to request it again.

> **Error correction** (e.g., Hamming code, Forward Error Correction) allows the receiver to actually reconstruct the correct data without needing retransmission, at the cost of sending extra redundant data upfront.

---

## 12. Quick Revision Cheat Sheet

| Topic              | One-line takeaway                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| OSI Model          | 7 conceptual layers: Physical → Data Link → Network → Transport → Session → Presentation → Application |
| TCP/IP Model       | The practical 4-layer model the real internet runs on                                                  |
| TCP                | Reliable, connection-oriented (3-way handshake) — used where correctness matters                       |
| UDP                | Fast, connectionless, no delivery guarantee — used where speed matters                                 |
| IP Address         | Logical, routable network identifier (IPv4 32-bit / IPv6 128-bit)                                      |
| DNS                | Translates domain names into IP addresses via resolvers and authoritative servers                      |
| HTTP               | Stateless application-layer protocol for web communication                                             |
| HTTPS              | HTTP + TLS encryption for secure, verified communication                                               |
| TLS Handshake      | Uses asymmetric crypto briefly to agree on a fast symmetric session key                                |
| NAT                | Lets multiple private devices share one public IP                                                      |
| Load Balancer      | Distributes traffic across multiple servers for scalability & availability                             |
| Congestion Control | TCP mechanism to avoid overwhelming the network (slow start, etc.)                                     |

---
