# Database Management Systems. (Interview Prep Guide)

> A complete, interview-style walkthrough of Database Management System fundamentals. Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to DBMS](#1-introduction-to-dbms)
2. [Database Architecture & Schemas](#2-database-architecture--schemas)
3. [ER Model & Relationships](#3-er-model--relationships)
4. [Keys in DBMS](#4-keys-in-dbms)
5. [Normalization](#5-normalization)
6. [SQL Essentials](#6-sql-essentials)
7. [Joins](#7-joins)
8. [Transactions & ACID Properties](#8-transactions--acid-properties)
9. [Concurrency Control](#9-concurrency-control)
10. [Indexing](#10-indexing)
11. [Deadlocks in DBMS](#11-deadlocks-in-dbms)
12. [NoSQL vs SQL](#12-nosql-vs-sql)
13. [Quick Revision Cheat Sheet](#13-quick-revision-cheat-sheet)

---

## 1. Introduction to DBMS.

### What is a DBMS and why not just use flat files (like CSVs) to store data?

> A DBMS (Database Management System) is software that lets you create, store, query and manage data efficiently and safely. Flat files break down at scale because they don't offer built-in concurrency control, don't enforce data integrity/relationships, are slow to search and can't easily be shared safely by multiple users/programs at once.

> A DBMS solves all of this with structured storage, indexing, transactions and query languages.

### What's the difference between DBMS and RDBMS?

> A **DBMS** stores data as files with no relationships between them (e.g., a simple file-based system). An **RDBMS** (Relational DBMS) stores data in structured **tables** with rows and columns, enforces relationships via keys and follows Codd's relational rules. Almost all modern production databases (MySQL, PostgreSQL, Oracle, SQL Server) are RDBMS.

### What are the advantages of using a DBMS?

> - Reduces data redundancy and inconsistency
> - Enforces data integrity via constraints
> - Provides concurrent access control
> - Supports backup & recovery
> - Offers a query language (SQL) for flexible data retrieval
> - Enforces security through user permissions

### What is Data Independence?

> It's the ability to change the schema at one level of the database without affecting the schema at a higher level.

> - **Physical Data Independence:** changing the physical storage (e.g., file structure, disk layout) doesn't affect the logical schema or application code.
> - **Logical Data Independence:** changing the logical schema (e.g., adding a new table/column) doesn't require rewriting application programs — harder to achieve than physical independence.

![DBMS Introduction & Architecture](https://media.geeksforgeeks.org/wp-content/uploads/20251226105423266324/dbms_tutorial.webp)

---

## 2. Database Architecture & Schemas.

### What is the Three-Schema Architecture?

> It's a way of separating the user applications from the physical database, in three layers:

> - **Internal (Physical) Schema:** how data is actually stored on disk (files, indexes, storage structures)
> - **Conceptual (Logical) Schema:** the overall logical structure of the entire database (tables, relationships, constraints) — independent of physical storage
> - **External (View) Schema:** what individual users/applications see — a specific "view" tailored to their needs, hiding irrelevant details

![Three-Schema Architecture](https://notesformsc.org/wp-content/uploads/2016/11/DBSchem.png)

### What is the difference between Schema and Instance?

> The **schema** is the overall design/blueprint of the database — defined once and rarely changed (like a table's column definitions).

> The **instance** is the actual data stored in the database at a particular moment in time — it changes constantly as data is inserted/updated/deleted.

### What's the difference between a 2-tier and 3-tier database architecture?

> In **2-tier**, the client application talks directly to the database server. In **3-tier**, there's a middle **application/business logic layer** between the client and the database — this is more scalable, secure and is the standard for most modern web applications (client → server/API → database).

---

## 3. ER Model & Relationships

### What is an Entity-Relationship (ER) Model?

> It's a conceptual, visual way of designing a database before implementation. It represents real-world things as **entities** (e.g., Student, Course), their properties as **attributes** (e.g., name, roll number) and the connections between them as **relationships** (e.g., "Student _enrolls in_ Course).

![ER Diagram Examples](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDILh8tIX5K42Err1JdEUwi_4HaTPa31l43S4K9Qxv49X-tLN0TSb8w26E&s=10)

### What's the difference between an Entity and an Entity Set?

> An **entity** is a single, specific real-world object (e.g., "Student Rahul, roll no. 12"). An **entity set** is the collection of all entities of the same type (e.g., "all Students").

### What are the types of attributes in the ER model?

> - **Simple** : can't be divided further (e.g., age)
> - **Composite** : can be broken into sub-parts (e.g., name → first name + last name)
> - **Derived** : can be calculated from other attributes (e.g., age derived from date of birth)
> - **Multi-valued** : can hold multiple values (e.g., phone numbers)

### What are the types of relationships (cardinality) in DBMS?

> - **One-to-One (1:1)** : one entity in A relates to exactly one in B (e.g., a person and their passport)
> - **One-to-Many (1:N)** : one entity in A relates to many in B (e.g., one department has many employees)
> - **Many-to-Many (M:N)** : multiple entities in A relate to multiple in B (e.g., students and courses)

### What's the difference between a Strong Entity and a Weak Entity?

> A **strong entity** has its own primary key and can exist independently. A **weak entity** has no primary key of its own — it depends on a strong entity ("owner entity") for identification, using a **partial key** plus the owner's key (e.g., a "Room" entity might depend on a "Building" entity to be uniquely identified).

---

## 4. Keys in DBMS.

### What are the different types of keys in a database?

> - **Primary Key** : Uniquely identifies each row in a table; can't be NULL or duplicate
> - **Candidate Key** : Any column (or set of columns) that _could_ qualify as a primary key (unique + not null); a table can have multiple candidate keys, one is chosen as primary
> - **Super Key** : Any combination of columns that uniquely identifies a row (a candidate key is a _minimal_ super key)
> - **Foreign Key** : A column in one table that references the primary key of another table, enforcing referential integrity
> - **Composite Key** : A primary key made up of two or more columns together
> - **Alternate Key** : Candidate keys that were _not_ chosen as the primary key

### What is Referential Integrity?

> It's a rule ensuring that a foreign key value in one table must either match an existing primary key value in the referenced table, or be NULL — preventing "orphan" references to non-existent rows.

### Can a Foreign Key be NULL?

> Yes, unless explicitly restricted with a `NOT NULL` constraint, a foreign key can be NULL, which usually means "no relationship exists yet" for that row (e.g., an employee not yet assigned to a manager).

---

## 5. Normalization

### What is Normalization and why do we do it?

> Normalization is the process of organizing tables to reduce data redundancy and avoid update/insert/delete anomalies, by breaking large tables into smaller, related ones based on functional dependencies.

![Normalization 1NF/2NF/3NF/BCNF](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuQpUQUURo3h9T7nN_3t8tVJxWfCJDr1cflFarf1DVLA&s=10)

![Normalization 1NF/2NF/3NF/BCNF-Comparison](https://media.geeksforgeeks.org/wp-content/uploads/20251222125632406705/before_normalization.webp)

### What are Insertion, Update and Deletion anomalies?

> These are problems caused by poor (unnormalized) table design:
>
> - **Insertion anomaly:** you can't add certain data without also having unrelated data (e.g., can't add a new course unless a student is already enrolled)
> - **Update anomaly:** the same data is repeated in multiple rows, so updating it means changing many rows — risk of inconsistency if missed
> - **Deletion anomaly:** deleting one piece of data unintentionally deletes other, unrelated data (e.g., deleting the last student in a department wipes out the department's info too)

### Can you explain the Normal Forms (1NF through BCNF)?

> | Normal Form                       | Rule                                                                                                                                                      |
> | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **1NF**                           | Every column must hold atomic (indivisible) values; no repeating groups or arrays in a single cell                                                        |
> | **2NF**                           | Must be in 1NF + no **partial dependency** — every non-key attribute must depend on the _entire_ primary key (relevant only when there's a composite key) |
> | **3NF**                           | Must be in 2NF + no **transitive dependency** — non-key attributes shouldn't depend on other non-key attributes                                           |
> | **BCNF** (Boyce-Codd Normal Form) | A stricter version of 3NF — for every functional dependency X → Y, X must be a super key                                                                  |

### What is a Functional Dependency?

> It's a constraint where one attribute (or set of attributes) uniquely determines another. If A → B, it means for every value of A, there's exactly one corresponding value of B (e.g., Roll_No → Name).

### What is Denormalization, and when would you use it?

> Denormalization is the deliberate process of introducing redundancy back into a normalized database, usually to improve read performance by reducing the number of joins needed. It's a common trade-off in read-heavy systems (e.g., reporting/analytics databases) where query speed matters more than storage efficiency or write-side consistency.

---

## 6. SQL Essentials.

### What's the difference between DDL, DML, DCL, and TCL?

> - **DDL (Data Definition Language):** defines structure : `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
> - **DML (Data Manipulation Language):** manipulates data : `INSERT`, `UPDATE`, `DELETE`, `SELECT`
> - **DCL (Data Control Language):** manages permissions : `GRANT`, `REVOKE`
> - **TCL (Transaction Control Language):** manages transactions : `COMMIT`, `ROLLBACK`, `SAVEPOINT`

### What's the difference between `DELETE`, `TRUNCATE`, and `DROP`?

> - **DELETE:** removes rows one at a time based on a condition (`WHERE`), logged, can be rolled back, triggers fire
> - **TRUNCATE:** removes _all_ rows quickly, minimal logging, generally can't be rolled back, resets auto-increment counters
> - **DROP:** removes the entire table structure itself, including schema, indexes, and data

### What's the difference between `WHERE` and `HAVING`?

> `WHERE` filters rows _before_ grouping/aggregation happens.

> `HAVING` filters groups _after_ aggregation (e.g., `GROUP BY` + `HAVING COUNT(*) > 5`).

> You can't use aggregate functions in `WHERE`, but you can in `HAVING`.

### What's the difference between `UNION` and `UNION ALL`?

> `UNION` combines results from two queries and removes duplicate rows (slower, due to the dedup step).

> `UNION ALL` combines them without removing duplicates (faster).

### What is a Subquery and what's a Correlated Subquery?

> A **subquery** is a query nested inside another query.

> A **correlated subquery** references a column from the outer query, meaning it's re-executed once for every row processed by the outer query (as opposed to a regular subquery, which runs once independently).

### What is a View, and why use one?

> A view is a virtual table based on the result of a stored SQL query. It doesn't store data itself (usually) — it simplifies complex queries, adds a layer of security (hiding sensitive columns) and provides a consistent interface even if underlying tables change.

### What is the difference between a Stored Procedure and a Function?

> A **stored procedure** performs an action/operation and can return zero, one, or multiple values (or none); it can also modify data (INSERT/UPDATE/DELETE) and can't be used directly inside a `SELECT` statement. A **function** must return exactly one value, is generally used for computation, and can be used inline within SQL statements like `SELECT`.

---

## 7. Joins

### What are the different types of SQL Joins?

> - **INNER JOIN** : Returns only matching rows from both tables
> - **LEFT (OUTER) JOIN** : All rows from the left table + matched rows from the right (unmatched = NULL)
> - **RIGHT (OUTER) JOIN** : All rows from the right table + matched rows from the left
> - **FULL (OUTER) JOIN** : All rows from both tables, matched where possible, NULL where not
> - **SELF JOIN** : A table joined with itself (e.g., finding employees and their managers within the same table)
> - **CROSS JOIN** : Cartesian product, every row from table A paired with every row from table B

![SQL Joins Explained with Venn Diagrams](https://red9.com/wp-content/uploads/2025/05/sql-joins-visualized-venn-diagram-red9.png)

### How would you find rows that exist in table A but NOT in table B?

> Typically a `LEFT JOIN` from A to B where the join key in B `IS NULL`:

```sql
SELECT A.*
FROM A
LEFT JOIN B ON A.id = B.id
WHERE B.id IS NULL;
```

---

## 8. Transactions & ACID Properties.

### What is a Transaction?

> A transaction is a single logical unit of work made up of one or more SQL operations, which either **all succeed together or all fail together** — there's no partial execution left behind.

### Can you explain the ACID properties?

> - **Atomicity:** the transaction is all-or-nothing — if any part fails, the entire transaction is rolled back
> - **Consistency:** the database moves from one valid state to another valid state, never violating constraints/rules
> - **Isolation:** concurrently running transactions don't interfere with each other — as if they ran one after another
> - **Durability:** once a transaction is committed, its changes are permanent, even if the system crashes right after

![ACID Properties in DBMS](https://media.geeksforgeeks.org/wp-content/uploads/20250728165405585326/acid_properties.webp)

### What are the different Transaction States?

> **Active** (executing) → **Partially Committed** (finished executing, not yet committed) → **Committed** (successfully finished, changes are permanent) OR **Failed** → **Aborted** (rolled back).

### What are the different Isolation Levels and what problems do they prevent?

> From weakest to strongest:

> | Isolation Level  | Prevents                                           |
> | ---------------- | -------------------------------------------------- |
> | Read Uncommitted | Nothing — allows dirty reads                       |
> | Read Committed   | Dirty reads                                        |
> | Repeatable Read  | Dirty reads + non-repeatable reads                 |
> | Serializable     | Dirty reads + non-repeatable reads + phantom reads |

### What is a Dirty Read, Non-Repeatable Read and Phantom Read?

> - **Dirty Read:** reading data that another transaction has changed but not yet committed (which could later be rolled back)
> - **Non-Repeatable Read:** reading the same row twice within a transaction and getting different values, because another transaction updated it in between
> - **Phantom Read:** re-running the same query within a transaction and getting a different _set of rows_, because another transaction inserted/deleted rows matching the query in between

---

## 9. Concurrency Control

### Why do we need Concurrency Control?

> When multiple transactions run at the same time on shared data, without control they can interfere with each other and violate isolation — causing lost updates, dirty reads, or inconsistent results. Concurrency control mechanisms ensure transactions behave as if they ran serially, one after another.

![Concurrency Control in DBMS](https://media.geeksforgeeks.org/wp-content/uploads/20250114163207428705/concurrency.webp)

### What is Lock-Based Concurrency Control?

> Transactions must acquire locks on data items before accessing them.
>
> - **Shared Lock (S):** Allows multiple transactions to read the same item, but none can write
> - **Exclusive Lock (X):** Only one transaction can hold it, allowing both read and write — blocks all other locks on that item

### What is Two-Phase Locking (2PL)?

> A protocol ensuring serializability, split into two phases:
>
> 1. **Growing phase:** Transaction can acquire locks, but not release any
> 2. **Shrinking phase:** Transaction can release locks, but not acquire any new ones

> Once a transaction releases its first lock, it can't acquire any more — this guarantees conflict-serializable schedules.

### What is Timestamp-Based Concurrency Control?

> Instead of locks, every transaction is given a unique timestamp when it starts. The system uses these timestamps to order conflicting operations — ensuring the equivalent of a serial schedule based on transaction age, rather than using locks.

### What is Optimistic vs Pessimistic Concurrency Control?

> **Pessimistic** control (like locking) assumes conflicts are likely, so it blocks access upfront.

> **Optimistic** control assumes conflicts are rare. Transactions proceed freely and only get validated for conflicts right before committing; if a conflict is found, the transaction is rolled back and retried.

> Optimistic works better in low-contention, read-heavy systems.

---

## 10. Indexing.

### What is an Index and why does it speed up queries?

> An index is a separate data structure (usually a B-Tree or B+ Tree) that stores a sorted reference to rows based on one or more column values. Instead of scanning the entire table (a "full table scan"), the database can use the index to jump almost directly to the relevant rows — similar to using a book's index instead of reading every page.

![Database Indexing Basics](https://cdn1.byjus.com/wp-content/uploads/2022/05/word-image195.png)

### What's the difference between a Clustered and Non-Clustered Index?

> A **clustered index** determines the _physical order_ of data in the table — there can be only one per table (often the primary key).

> A **non-clustered index** is a separate structure that just points back to the actual data rows. You can have multiple per table.

### What are the trade-offs of adding indexes?

> Indexes dramatically speed up `SELECT`/read queries and lookups, but they slow down `INSERT`/`UPDATE`/`DELETE` operations (since the index also needs to be updated) and they consume additional disk space. Over-indexing a write-heavy table can hurt performance overall.

### Why are B+ Trees preferred over plain B-Trees for database indexes?

> In a B+ Tree, all actual data pointers are stored only in the leaf nodes, and the leaf nodes are linked together in a sorted sequence. This makes range queries (e.g., `BETWEEN`, `ORDER BY`) and full scans much faster, since you can traverse the leaves directly without going back up the tree.

---

## 11. Deadlocks in DBMS.

### How does a Deadlock happen in a database and how is it different from an OS deadlock conceptually?

> A DBMS deadlock happens when two or more transactions are each waiting for a lock held by the other, forming a cycle (e.g., Transaction A holds a lock on Row 1 and wants Row 2, while Transaction B holds a lock on Row 2 and wants Row 1). Conceptually it's the same circular-wait idea as OS deadlocks, just applied to row/table locks instead of generic resources.

![Database Deadlock Guide](https://media.geeksforgeeks.org/wp-content/cdn-uploads/deadlock.png)

### How do databases typically handle deadlocks?

> Most production databases don't try to _avoid_ deadlocks proactively (too costly); instead they **detect** them using a wait-for graph and resolve them by picking a "victim" transaction to abort and roll back, letting the others proceed. The aborted transaction is usually retried by the application.

### How can you minimize the chance of deadlocks as an application developer?

> Always access tables/rows in a **consistent order** across transactions, keep transactions short, avoid unnecessary locks and use appropriate isolation levels rather than always defaulting to the strictest one.

---

## 12. NoSQL vs SQL

### When would you choose a NoSQL database over a relational one?

> NoSQL databases (like MongoDB, Cassandra, Redis) are preferred when: the data is unstructured or rapidly changing in shape, you need to scale horizontally across many servers easily, you're optimizing for very high write throughput, or your data naturally fits a document/key-value/graph/wide-column model rather than rigid rows and columns.

### What is the CAP Theorem?

> In a distributed data system, you can only fully guarantee **two out of three** of:

> - **Consistency:** Every read gets the most recent write
> - **Availability:** Every request gets a response, even if some nodes are down
> - **Partition Tolerance:** The system keeps working despite network failures between nodes

> Since network partitions are unavoidable in real distributed systems, the real trade-off in practice is usually between Consistency and Availability.

### What's the difference between SQL and NoSQL in terms of schema?

> SQL databases enforce a fixed schema upfront (columns/types defined before inserting data). NoSQL databases are generally **schema-less** or schema-flexible, allowing documents/records in the same collection to have different fields — useful for evolving or varied data, but it pushes more consistency responsibility onto the application layer.

---

## 13. Quick Revision Cheat Sheet

| Topic            | One-line takeaway                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------ |
| RDBMS            | Data stored in related tables enforced via keys                                            |
| ER Model         | Conceptual design using entities, attributes, relationships                                |
| Keys             | Primary/Foreign/Candidate/Composite keys enforce uniqueness & relationships                |
| Normalization    | Reduces redundancy by splitting tables based on dependencies (1NF→BCNF)                    |
| Joins            | Combine rows from multiple tables (INNER/LEFT/RIGHT/FULL/SELF)                             |
| ACID             | Atomicity, Consistency, Isolation, Durability — transaction guarantees                     |
| Isolation Levels | Control trade-off between consistency and concurrency                                      |
| 2PL              | Growing phase (acquire locks) then shrinking phase (release locks)                         |
| Indexing         | B+ Tree structure that speeds up reads at the cost of slower writes                        |
| Deadlock         | Circular lock wait between transactions — resolved via detection + rollback                |
| CAP Theorem      | Distributed systems can only guarantee 2 of Consistency, Availability, Partition Tolerance |

---