# Operating Systems (Interview Prep Guide).

> A complete, interview-style walkthrough of Operating System fundamentals. Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to OS](#1-introduction-to-os)
2. [Process Management](#2-process-management)
3. [Threads & Multithreading](#3-threads--multithreading)
4. [CPU Scheduling](#4-cpu-scheduling)
5. [Process Synchronization](#5-process-synchronization)
6. [Deadlocks](#6-deadlocks)
7. [Memory Management](#7-memory-management)
8. [Virtual Memory & Page Replacement](#8-virtual-memory--page-replacement)
9. [File Systems](#9-file-systems)
10. [Disk Scheduling & I/O Management](#10-disk-scheduling--io-management)
11. [Quick Revision Cheat Sheet](#11-quick-revision-cheat-sheet)

---

## 1. Introduction to OS.

### What is an Operating System and why does it exist?

> An OS is system software that sits between the hardware and the user/applications. It manages hardware resources (CPU, memory, disk, I/O devices) and provides a stable, consistent way for programs to run without each one needing to talk to hardware directly. Think of it as a resource manager + traffic controller.

### What are the main functions of an OS?

> - Process management (creating, scheduling, terminating processes)
> - Memory management (allocation, protection, virtual memory)
> - File system management (storage, organization, access control)
> - I/O device management
> - Security and access control
> - Providing a user interface (CLI/GUI)

### What's the difference between a program and a process?

> A **program** is a passive set of instructions stored on disk (e.g., an `.exe` file). A **process** is an _active_ instance of that program — loaded into memory, with its own state, registers and resources, currently being executed or waiting to execute.

### What is the difference between Kernel Mode and User Mode?

> **Kernel mode** has unrestricted access to hardware and can execute any CPU instruction, this is where the OS core runs. **User mode** is restricted; normal applications run here and must request hardware access via **system calls**, which trigger a mode switch. This separation protects the system from crashing or being corrupted by buggy/malicious user programs.

### What is a system call & can you name a few?

> A system call is the interface through which a user-mode program requests a service from the kernel — e.g., reading a file, creating a process or allocating memory.

> Examples: `fork()`, `exec()`, `read()`, `write()`, `open()`, `close()`.

![OS Structure & System Calls](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwM8LmC3gIyqAdTYu8kgQu9mq9IzHsC_WZ6LMWP5-HABXPF-sINfzmE9s&s=10)

---

## 2. Process Management.

### What is a Process Control Block (PCB)?

> A PCB is a data structure the OS maintains for every process. It stores everything needed to manage and resume the process: process ID, process state, program counter, CPU registers, memory management info, scheduling priority and list of open files. When the OS switches between processes, it saves/restores the PCB.

### What are the different states a process goes through?

> Typically five states:
>
> - **New** : process is being created
> - **Ready** : waiting to be assigned to the CPU
> - **Running** : instructions are being executed
> - **Waiting/Blocked** : waiting for an I/O operation or event
> - **Terminated** : finished execution

![Process States Diagram](https://media.geeksforgeeks.org/wp-content/uploads/20250825180931532602/bb.webp)

### What is a Context Switch and why is it "expensive"?

> A context switch is the act of saving the state (PCB) of the currently running process and loading the state of the next process to run.

> It's "expensive" because it's pure overhead. No useful work is done during the switch and it can also cause cache/TLB misses, slowing down the next process temporarily.

### What is the difference between `fork()` and `exec()`?

> `fork()` creates a new child process that is a near-identical copy of the parent (same code, duplicated memory space, different PID).

> `exec()` replaces the current process's memory image with a new program. They're often used together: `fork()` then `exec()` is the classic Unix pattern for launching a new program from a running one (e.g., how a shell launches commands).

### What's the difference between a Zombie process and an Orphan process?

> - **Zombie process:** A process that has finished executing but still has an entry in the process table because its parent hasn't yet read its exit status (via `wait()`).
> - **Orphan process:** A process whose parent has terminated before it did; it gets adopted by the `init`/root process.

### What is Inter-Process Communication (IPC) and what are common mechanisms?

> IPC is how independent processes exchange data and synchronize actions. Common mechanisms: **Pipes**, **Message Queues**, **Shared Memory**, **Sockets** and **Signals**. Shared memory is the fastest (no kernel copying involved) but requires explicit synchronization.

---

## 3. Threads & Multithreading.

### What is a thread and how is it different from a process?

> A thread is the smallest unit of execution within a process. Multiple threads within the same process **share the same memory space, code and file descriptors**, but each has its own stack, program counter and registers. Processes, by contrast, are isolated from each other with separate memory spaces.

![Process vs Thread – Baeldung](https://www.baeldung.com/wp-content/uploads/sites/4/2021/05/processvsthread3-300x270-1.png)

### Why use multithreading instead of multiple processes?

> Threads are lighter weight to create and switch between (no full memory space duplication) and they share memory, making data sharing between threads much faster and simpler than IPC between processes.

> Downside: because they share memory, threads are more prone to race conditions and need careful synchronization.

### What is the difference between concurrency and parallelism?

> **Concurrency** means multiple tasks make progress within the same time frame, they may or may not run at the exact same instant (achieved via context switching on a single core).

> **Parallelism** means multiple tasks literally execute at the same instant, requiring multiple CPU cores.

### What is the difference between User-level threads and Kernel-level threads?

> **User-level threads** are managed by a library in user space; the kernel doesn't know they exist, so they're fast to create/switch but a single blocking call can block the entire process.

> **Kernel-level threads** are managed and scheduled directly by the OS; slower to manage, but if one thread blocks, others can still run.

### What is a race condition?

> A race condition occurs when two or more threads/processes access shared data concurrently and the final result depends on the unpredictable timing/order of execution. It's the core reason synchronization primitives (locks, semaphores) exist.

---

## 4. CPU Scheduling.

### What is CPU scheduling and why is it needed?

> Since there are usually more processes than CPU cores, the OS scheduler decides which process in the **Ready queue** gets the CPU next. Good scheduling maximizes CPU utilization, throughput and fairness while minimizing waiting time and response time.

![CPU Scheduling](https://scaler.com/topics/images/what-is-cpu-scheduling.webp)

### What's the difference between preemptive and non-preemptive scheduling?

> In **preemptive** scheduling, the OS can forcibly take the CPU away from a running process (e.g., when a higher-priority process arrives).

> In **non-preemptive** scheduling, once a process gets the CPU, it keeps it until it finishes or voluntarily yields (e.g., for I/O).

### Can you explain the common CPU scheduling algorithms?

> | Algorithm                     | Type           | Key Idea                                                                                                         |
> | ----------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
> | FCFS (First Come First Serve) | Non-preemptive | Processes run in arrival order — simple but can cause the "convoy effect"                                        |
> | SJF (Shortest Job First)      | Both           | Picks the process with smallest burst time — optimal for average waiting time, but starvation risk for long jobs |
> | Round Robin                   | Preemptive     | Each process gets a fixed time quantum in a cyclic order — fair, good for time-sharing systems                   |
> | Priority Scheduling           | Both           | Process with highest priority runs first — risk of starvation, solved via "aging"                                |
> | Multilevel Queue / MLFQ       | Preemptive     | Multiple ready queues for different process types/priorities, with rules to move between them                    |

### What is the "Convoy Effect"?

> It happens in FCFS scheduling when a long process holds the CPU while many short processes queue up behind it, drastically increasing their average waiting time. Like being stuck behind a slow truck on a single-lane road.

### What is Starvation, and how is it fixed?

> Starvation is when a process waits indefinitely because the scheduler keeps favoring other processes (common in priority scheduling). It's fixed using **aging**, gradually increasing the priority of processes that have been waiting a long time.

### How do you calculate Waiting Time and Turnaround Time?

> - **Turnaround Time** = Completion Time − Arrival Time
> - **Waiting Time** = Turnaround Time − Burst Time

---

## 5. Process Synchronization

### What is the Critical Section problem?

> The critical section is the part of code where a process accesses shared resources (variables, files, data structures). The Critical Section Problem is about designing a protocol so that when one process is executing in its critical section, no other process is allowed to execute in its own critical section for the same resource — preventing race conditions.

### What are the three requirements a solution to the critical section problem must satisfy?

> 1. **Mutual Exclusion** : only one process in the critical section at a time
> 2. **Progress** : if no process is in the critical section, one of the waiting processes should be allowed in without indefinite delay
> 3. **Bounded Waiting** : there must be a limit on how many times other processes can enter before a waiting process gets its turn

### What is a Mutex and how is it different from a Semaphore?

> - **Mutex** is a locking mechanism — binary and ownership-based (only the thread that locked it can unlock it). Used purely for mutual exclusion.
> - **Semaphore** is a signaling mechanism using a counter. A **binary semaphore** (0/1) behaves like a mutex, but a **counting semaphore** can allow a set number of processes to access a resource pool simultaneously (e.g., a pool of DB connections). Semaphores can be signaled ("released") by a different thread than the one that waited on it.

### What is a Deadlock vs a Race Condition vs a Livelock?

> - **Race condition:** outcome depends on unpredictable timing of concurrent access
> - **Deadlock:** processes are stuck permanently waiting on each other, none can proceed
> - **Livelock:** processes keep changing state in response to each other but still make no actual progress (like two people repeatedly stepping aside for each other in a hallway)

### Can you explain the Producer-Consumer Problem?

> It's a classic synchronization problem: a "producer" generates data and puts it into a shared, fixed-size buffer. A "consumer" removes data from the buffer.

> You need synchronization to ensure the producer doesn't add to a full buffer and the consumer doesn't remove from an empty one. Typically solved using two counting semaphores (`empty` and `full`) plus a mutex.

![Producer-Consumer Problem](https://prepinsta.com/operating-systems/producer-consumer-problem/)

### What are Monitors, and how do they differ from semaphores?

> A monitor is a higher-level synchronization construct, essentially a class/module where only one thread can execute a method at a time (built-in mutual exclusion), plus condition variables for waiting/signaling.

> Monitors are easier to use correctly than raw semaphores because the locking is handled implicitly by the language/runtime rather than manually by the programmer.

---

## 6. Deadlocks.

### What is a deadlock?

> A deadlock is a state where a set of processes are all blocked, each waiting for a resource held by another process in the same set. So none of them can ever proceed without outside intervention.

### What are the four necessary conditions for a deadlock (Coffman conditions)?

> All four must hold simultaneously:

> 1. **Mutual Exclusion** : At least one resource is held in a non-shareable mode.
> 2. **Hold and Wait** : A process holding a resource is waiting to acquire more/
> 3. **No Preemption** : Resources can't be forcibly taken away; must be released voluntarily.
> 4. **Circular Wait** : A closed chain of processes, each waiting for a resource held by the next.

![Deadlock & Resource Allocation Graph](https://media.geeksforgeeks.org/wp-content/uploads/20250116142222043136/d.webp)

### What's the difference between Deadlock Prevention, Avoidance and Detection?

> - **Prevention:** design the system so at least one of the four Coffman conditions can never hold (e.g., request all resources upfront)
> - **Avoidance:** allow all conditions to hold, but carefully analyze resource requests in advance to ensure the system never enters an unsafe state (e.g., Banker's Algorithm)
> - **Detection & Recovery:** let deadlocks happen, detect them periodically (e.g., via a resource allocation graph / wait-for graph), then recover by killing or rolling back processes

### Can you explain the Banker's Algorithm?

> It's a deadlock-avoidance algorithm. Before granting a resource request, the OS pretends to grant it and checks if the system would still be in a "safe state" — meaning there's some order in which all processes can finish with the available resources.

> If yes, it grants the request; if not, the process waits. It requires knowing the maximum resource need of each process in advance.

### How do you break a deadlock once it's detected?

> Two main approaches:
>
> - **Process termination** : Kill one or more processes in the cycle (either all at once, or one at a time until the deadlock breaks)
> - **Resource preemption** : Forcibly take a resource from one process and give it to another, then roll that process back to a safe state

---

## 7. Memory Management.

### What is the difference between Logical Address and Physical Address?

> A **logical (virtual) address** is generated by the CPU during program execution, it's what the program "sees."

> A **physical address** is the actual location in RAM. The **Memory Management Unit (MMU)** translates logical addresses to physical addresses at runtime.

### What is Paging?

> Paging is a memory management scheme that eliminates the need for contiguous memory allocation. Physical memory is divided into fixed-size blocks called **frames** and logical memory is divided into equal-size blocks called **pages**.

> A **page table** maps each page to a frame, which prevents external fragmentation (though internal fragmentation can still occur).

![Paging Diagram](https://scaler.com/topics/images/contiguous-allocation-of-pages.webp)

### What is Segmentation and how is it different from Paging?

> Segmentation divides memory based on logical divisions of a program (like code, stack, heap, data segments) rather than fixed-size blocks. Unlike paging, segments can be of variable size and it mirrors how programmers actually think about a program's structure. Segmentation can suffer from **external fragmentation**; paging generally doesn't.

### What is Internal vs External Fragmentation?

> - **Internal fragmentation:** wasted space _within_ an allocated block, because the block is larger than what's actually needed (common in paging, due to fixed frame sizes)
> - **External fragmentation:** free memory exists but is scattered in small, non-contiguous chunks, so it can't be used to satisfy a large request (common in segmentation / variable partitioning)

### What is a Page Table, and what's the problem with it at scale?

> A page table stores the mapping of virtual pages to physical frames for a process. The problem: for large address spaces, a single-level page table can become huge (using a lot of memory itself). This is solved with **multi-level page tables** or **inverted page tables**.

### What is a TLB (Translation Lookaside Buffer)?

> The TLB is a small, fast hardware cache that stores recent virtual-to-physical address translations. Instead of hitting the page table (which lives in main memory and is slow) on every memory access, the CPU checks the TLB first — a **TLB hit** is fast; a **TLB miss** requires a full page table walk.

---

## 8. Virtual Memory & Page Replacement.

### What is Virtual Memory and why is it useful?

> Virtual memory is a technique that gives each process the illusion of having its own large, contiguous block of memory, even though physical RAM may be smaller and fragmented. It allows programs larger than physical memory to run (via disk-backed swapping) and provides memory isolation/protection between processes.

### What is a Page Fault?

> A page fault occurs when a process tries to access a page that is not currently loaded into physical memory (it's marked "invalid" in the page table). The OS then pauses the process, fetches the page from disk into a free frame, updates the page table and resumes execution.

### What are the common Page Replacement algorithms?

> | Algorithm                   | Idea                                                                   | Note                                                                              |
> | --------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
> | FIFO                        | Replace the oldest loaded page                                         | Simple, but can suffer from **Belady's Anomaly**                                  |
> | Optimal (OPT)               | Replace the page that won't be used for the longest time in the future | Theoretically best, but not implementable in practice (requires future knowledge) |
> | LRU (Least Recently Used)   | Replace the page that hasn't been used for the longest time            | Good approximation of OPT, widely used                                            |
> | LFU (Least Frequently Used) | Replace the page used the least number of times                        | Struggles with pages that were popular early but not anymore                      |

![Page Replacement Algorithms](https://media.geeksforgeeks.org/wp-content/uploads/20241023184405860059/page3.jpg)

### What is Belady's Anomaly?

> It's a counter-intuitive phenomenon (seen in FIFO) where _increasing_ the number of page frames available can actually _increase_ the number of page faults, instead of decreasing them.

### What is Thrashing?

> Thrashing happens when a system spends more time swapping pages in and out of memory (handling page faults) than actually executing processes, usually because too many processes are competing for too little physical memory.

> The fix: reduce the degree of multiprogramming or use the **Working Set model** to allocate frames based on each process's actual active memory usage.

---

## 9. File Systems.

### What is a File System, and what does it manage?

> A file system defines how data is stored, organized, named and retrieved on a storage device. It manages the mapping between logical files (what users see: names, folders) and physical storage blocks, along with metadata (permissions, timestamps, size).

### What are the common file allocation methods?

> - **Contiguous Allocation:** Each file occupies a contiguous set of blocks i.e., fast access, but causes external fragmentation and files can't easily grow.
> - **Linked Allocation:** Each file is a linked list of blocks scattered anywhere on disk i.e., no external fragmentation, but slow random access and pointer overhead.
> - **Indexed Allocation:** Each file has an index block containing pointers to all its data blocks i.e., supports fast random access, avoids the downsides of the other two (used in systems like Unix's inode approach).

### What is an inode?

> An inode ("index node") is a data structure in Unix-like file systems that stores metadata about a file — permissions, owner, size, timestamps and pointers to the data blocks. But notably **not** the filename itself (that mapping lives in the directory entry).

### What's the difference between Hard Links and Soft (Symbolic) Links?

> A **hard link** is a direct reference to the same inode as the original file. Deleting the original doesn't remove the data as long as a hard link exists. A **soft link** is a separate file that just stores a path pointing to the original. If the original is deleted, the symlink becomes a dangling/broken reference.

### How does a File System keep track of free disk space?

> Common techniques: a **free space bitmap** (one bit per block, indicating free/used), a **linked list of free blocks** or **grouping/counting** approaches. Bitmaps are simple and fast to scan for contiguous free space.

---

## 10. Disk Scheduling & I/O Management.

### Why is Disk Scheduling needed?

> A hard disk has a physical read/write head that must move (seek) to the right track before reading/writing. Since seek time is the biggest bottleneck in disk I/O, the OS schedules the order of pending disk requests to minimize total head movement and improve throughput.

![SCAN Disk Scheduling](https://files.codingninjas.in/article_images/scan-vs-c-scan-disk-scheduling-0-1655152883.jpg)

![C-SCAN Disk Scheduling](https://files.codingninjas.in/article_images/scan-vs-c-scan-disk-scheduling-1-1655189367.webp)

### Can you explain the main Disk Scheduling algorithms?

> | Algorithm                       | Idea                                                                                                                                          |
> | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
> | FCFS                            | Serves requests in arrival order — simple but inefficient (no optimization of head movement)                                                  |
> | SSTF (Shortest Seek Time First) | Always serves the closest request next — efficient short-term but can cause starvation for far-away requests                                  |
> | SCAN ("elevator algorithm")     | Head moves in one direction serving requests, reverses at the end, like an elevator                                                           |
> | C-SCAN                          | Like SCAN, but after reaching one end, it jumps back to the start without serving requests on the return trip — gives more uniform wait times |
> | LOOK / C-LOOK                   | Like SCAN/C-SCAN, but the head only goes as far as the last request in that direction, instead of the disk's physical end                     |

### What is the difference between Synchronous and Asynchronous I/O?

> In **synchronous I/O**, the calling process blocks (waits) until the I/O operation completes.

> In **asynchronous I/O**, the process issues the request and continues executing other work; it's notified (via interrupt/callback) when the I/O finishes.

### What is Spooling and why is it used?

> Spooling (Simultaneous Peripheral Operations On-Line) temporarily stores data in a buffer/queue (usually on disk) for a slow device like a printer, so a faster process (the CPU) isn't held up waiting for the slow device — jobs are processed from the queue independently.

### What is DMA (Direct Memory Access), and why does it matter?

> DMA lets certain hardware devices transfer data directly to/from main memory without needing the CPU to copy every byte. This drastically reduces CPU overhead during large I/O transfers (e.g., disk-to-memory), freeing the CPU to do other work while the transfer happens.

---

## 11. Quick Revision Cheat Sheet

| Topic              | One-line takeaway                                                       |
| ------------------ | ----------------------------------------------------------------------- |
| Process            | An active, running instance of a program with its own memory & PCB      |
| Thread             | Lightweight execution unit sharing memory within a process              |
| Context Switch     | Overhead of saving/restoring process state when switching execution     |
| CPU Scheduling     | Decides which ready process gets the CPU next (FCFS, SJF, RR, Priority) |
| Critical Section   | Code segment accessing shared resources — needs mutual exclusion        |
| Mutex vs Semaphore | Mutex = ownership lock; Semaphore = counter-based signaling             |
| Deadlock           | Circular wait among processes — needs all 4 Coffman conditions          |
| Paging             | Fixed-size memory blocks (pages/frames) to avoid external fragmentation |
| Virtual Memory     | Illusion of large memory using disk-backed page swapping                |
| Page Replacement   | LRU/FIFO/Optimal — decide which page to evict on a page fault           |
| Thrashing          | Excessive page faulting eating up all CPU time                          |
| Disk Scheduling    | Minimizes seek time (SCAN, C-SCAN, SSTF)                                |

---