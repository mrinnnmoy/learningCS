# Software Engineering - Basics. (Interview Prep Guide)

> A complete, interview-style walkthrough of core Software Engineering fundamentals including the practical, process-oriented knowledge (SDLC, Agile, Git, testing, CI/CD) that interviewers expect on top of pure coding/DSA skills. Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to Software Engineering](#1-introduction-to-software-engineering)
2. [Software Development Life Cycle (SDLC)](#2-software-development-life-cycle-sdlc)
3. [SDLC Models](#3-sdlc-models)
4. [Agile & Scrum](#4-agile--scrum)
5. [Version Control & Git](#5-version-control--git)
6. [Software Testing](#6-software-testing)
7. [CI/CD & DevOps Basics](#7-cicd--devops-basics)
8. [Software Design & Documentation](#8-software-design--documentation)
9. [Code Quality & Maintainability](#9-code-quality--maintainability)
10. [Project Management Basics](#10-project-management-basics)
11. [Quick Revision Cheat Sheet](#11-quick-revision-cheat-sheet)

---

## 1. Introduction to Software Engineering.

### What is Software Engineering and how is it different from just "programming"?

> Software Engineering is the disciplined, systematic approach to designing, developing, testing, deploying and maintaining software — it's concerned with the _entire lifecycle_ of a product, not just writing code.

> Programming is one part of it (translating a design into working code), while software engineering also covers requirements gathering, architecture, testing strategy, collaboration processes, and long-term maintainability.

### Why do software projects need a defined process instead of just "start coding"?

> Without a structured process, projects tend to suffer from unclear requirements, scope creep, poor coordination between team members, untested/buggy releases and difficulty maintaining the code long-term. A defined process (like SDLC or Agile) creates predictability, makes it easier to track progress, and reduces the risk of costly late-stage surprises.

### What are the key qualities of "good" software, beyond just "it works"?

> Correctness, reliability, maintainability, scalability, security, usability, and performance. Interviewers often want to hear that "working code" isn't the only bar — code also needs to be understandable to other developers, safe to change later, and robust enough to handle real-world edge cases and failures.

![Software Engineering Overview](https://www.springboard.com/blog/wp-content/uploads/2022/09/software-engineers-role.jpg)

---

## 2. Software Development Life Cycle (SDLC).

### What is SDLC and what are its main phases?

> SDLC (Software Development Life Cycle) is a structured process for building software, broken into phases:
>
> 1. **Requirement Analysis** : Understand what the client/users actually need
> 2. **Planning** : Estimate cost, timeline, resources, risks
> 3. **Design** : Define architecture, database schema, system components (HLD/LLD)
> 4. **Implementation (Coding)** : Developers write the actual code
> 5. **Testing** : Verify the software works as intended and catch bugs
> 6. **Deployment** : Release the software to production/users
> 7. **Maintenance** : Fix bugs, add improvements and support the software post-release

![SDLC Phases Diagram](https://www.eurotechconseil.com/wp-content/uploads/2022/10/SLDC.webp)

### Why is the Requirement Analysis phase considered so critical?

> Because mistakes made here are the most expensive to fix later — if requirements are misunderstood or incomplete, everything built on top of them (design, code, tests) may need to be reworked. It's far cheaper to catch a misunderstanding on paper during planning than after the product has already been built and deployed.

### What is the difference between Verification and Validation in SDLC?

> **Verification** asks "are we building the product _right_?" — checking that the software meets its specified design/requirements at each stage (often through reviews, walkthroughs).

> **Validation** asks "are we building the _right_ product?" — checking that the finished software actually satisfies the user's real needs (often through actual testing/user feedback).

---

## 3. SDLC Models.

### What is the Waterfall Model?

> A linear, sequential SDLC model where each phase must be fully completed before the next one begins (requirements → design → implementation → testing → deployment → maintenance), with little to no going back. It's simple to understand and manage, but inflexible — a mistake or changed requirement discovered late is very costly to fix.

![Waterfall vs Agile Comparison](https://media.geeksforgeeks.org/wp-content/uploads/20220405105811/waterfall.jpg)

### What is the Agile Model and how is it different from Waterfall?

> Agile breaks the project into small, iterative cycles ("sprints"), each producing a working increment of the software, with continuous feedback and re-prioritization along the way. Unlike Waterfall's rigid, one-pass sequence, Agile embraces changing requirements and delivers value incrementally rather than all at once at the very end.

### What is the V-Model?

> A variation of Waterfall where each development phase has a corresponding testing phase directly across from it (e.g., requirement analysis pairs with acceptance testing, system design pairs with system testing), emphasizing that testing should be planned in parallel with development, not just tacked on at the end.

### What is the Spiral Model?

> An iterative model that combines elements of Waterfall with a strong focus on **risk analysis** — each "loop" of the spiral goes through planning, risk assessment, engineering, and evaluation, gradually refining the product. It's often used for large, high-risk projects where identifying and mitigating risk early is a priority.

### When would you choose Waterfall over Agile (or vice versa)?

> **Waterfall** fits well when requirements are well understood upfront and unlikely to change (e.g., government/compliance projects with fixed specs).

> **Agile** fits better when requirements are expected to evolve, when getting user feedback early and often is valuable, and in most modern product/web development contexts — which is why Agile (and specifically Scrum) dominates the industry today.

---

## 4. Agile & Scrum.

### What is Agile and what are its core values?

> Agile is a software development philosophy centered on iterative development, collaboration, and adaptability. The Agile Manifesto values:

> - Individuals and interactions **over** processes and tools
> - Working software **over** comprehensive documentation
> - Customer collaboration **over** contract negotiation
> - Responding to change **over** following a rigid plan

### What is Scrum and how does it relate to Agile?

> Scrum is a specific, popular **framework** for implementing Agile principles. Agile is the broader philosophy; Scrum gives you the concrete structure (roles, events, artifacts) to actually run an Agile process day-to-day.

![Scrum Sprint Cycle](https://www.wrike.com/tp/storage/uploads/92025823-45d4-4b1c-bcef-6dffd4727344/scrum-cycle-resized.png)

### What are the key roles in Scrum?

> - **Product Owner:** Represents the customer/business, prioritizes the backlog, defines what should be built
> - **Scrum Master:** Facilitates the process, removes blockers, ensures the team follows Scrum practices (not a traditional "manager")
> - **Development Team:** The engineers/designers who actually build the product increment each sprint

### What is a Sprint and what typically happens during one?

> A sprint is a fixed, short time-box (commonly 1-4 weeks) during which the team commits to completing a set of work items from the backlog. It typically includes: **Sprint Planning** (deciding what to work on), daily **Standups** (quick sync on progress/blockers), the actual development work, a **Sprint Review** (demoing what was built), and a **Sprint Retrospective** (reflecting on what went well/poorly to improve the next sprint).

### What is a Product Backlog vs a Sprint Backlog?

> The **Product Backlog** is the full, prioritized list of everything that could be built for the product (features, bugs, technical debt) — it's constantly evolving.

> The **Sprint Backlog** is the specific subset of backlog items the team has committed to completing within the current sprint.

### What is a Daily Standup and why keep it short?

> A brief (usually ~15 minute) daily meeting where each team member shares what they did yesterday, what they're doing today, and any blockers. It's kept short intentionally — it's meant for quick synchronization and surfacing blockers, not detailed problem-solving (which should happen in separate follow-up conversations).

### What's the difference between Scrum and Kanban?

> **Scrum** works in fixed-length sprints with defined roles and ceremonies, and a sprint's scope is locked once planning is done.

> **Kanban** is a continuous flow model — there are no fixed sprints; work items move through stages on a board (To Do → In Progress → Done) and new work can be pulled in as capacity allows, making it more flexible for teams with constantly shifting priorities (like support/ops teams).

---

## 5. Version Control & Git.

### What is Version Control and why is it essential?

> Version control is a system that tracks changes to code over time, allowing multiple people to collaborate without overwriting each other's work and letting you review history, revert mistakes and work on parallel features safely. It's essential because virtually no real-world software is built by a single person editing one file forever — coordination and history tracking become necessary almost immediately.

### What's the difference between Git and GitHub?

> **Git** is the actual version control _tool/software_, it runs locally and tracks changes to your code.

> **GitHub** is a cloud-based _hosting platform_ for Git repositories, adding collaboration features on top (pull requests, issues, code review, CI/CD integration). You can use Git without GitHub (e.g., with GitLab, Bitbucket, or just locally), but GitHub doesn't work without Git underneath it.

### What is the difference between `git merge` and `git rebase`?

> `git merge` combines two branches by creating a new "merge commit" that ties both histories together — preserves full history, but can create a messier, non-linear commit log.

> `git rebase` replays your branch's commits on top of the target branch's latest commit, producing a clean, linear history — but it rewrites commit history, which can be risky/confusing on shared branches.

![Git Branching Workflow Diagram](https://images.edrawmax.com/what-is/gitflow-diagram/2-git-flow-model.png)

### What is a Merge Conflict and how do you resolve one?

> A merge conflict happens when Git can't automatically reconcile changes because two branches modified the same lines of the same file differently. Resolving it means manually reviewing the conflicting sections (Git marks them with `<<<<<<<`, `=======`, `>>>>>>>`), deciding which changes to keep (or combining them), then committing the resolved result.

### What's the difference between `git fetch` and `git pull`?

> `git fetch` downloads the latest changes from the remote repository but doesn't merge them into your current branch — it just updates your local knowledge of the remote.

> `git pull` does a fetch _and_ automatically merges (or rebases) those changes into your current branch in one step.

### What is a Feature Branch workflow and why use it instead of everyone committing to `main`?

> In a feature branch workflow, each new feature/bugfix is developed on its own separate branch, then merged into `main` (usually via a Pull Request/code review) once it's complete and tested. This keeps `main` always in a stable, deployable state, and allows multiple people to work on different features in parallel without stepping on each other's in-progress code.

### What is a Pull Request (PR) and why does the code review process matter?

> A Pull Request is a request to merge changes from one branch into another, giving teammates a chance to review the code, leave comments, request changes, and run automated checks before it's merged. Code review catches bugs and design issues early, spreads knowledge of the codebase across the team, and maintains a consistent code quality standard.

---

## 6. Software Testing.

### What are the main types of testing and how do they differ?

> - **Unit Testing:** Tests a single, small piece of code (a function/method) in isolation
> - **Integration Testing:** Tests how multiple units/modules work together (e.g., does the service correctly talk to the database)
> - **System Testing:** Tests the entire, fully integrated system as a whole against requirements
> - **Acceptance Testing:** Verifies the system meets business/user requirements, often done by/with actual stakeholders before release
> - **End-to-End (E2E) Testing:** Simulates real user workflows through the entire application stack, front to back

![Testing Pyramid – Unit vs Integration vs E2E](https://www.twilio.com/content/dam/twilio-com/global/en/blog/legacy/2022/unit-integration-end-to-end-testing-difference/T-Cz8M1tQe_7ltDY_nP9ABAzmRsxNZu9UTIFUkDDnDy_-6KRjK9DfQ-Er9hw7cbRldk246sbKgJC3Z.png)

### What is the "Testing Pyramid" and why is it shaped like a pyramid?

> The Testing Pyramid is a model suggesting you should have **many** fast, cheap unit tests at the base, **fewer** integration tests in the middle, and the **fewest** slow, expensive end-to-end tests at the top. The shape reflects a trade-off: unit tests are fast and pinpoint failures precisely but don't catch integration issues, while E2E tests catch real user-facing problems but are slow, brittle, and expensive to maintain — so you want most of your confidence coming from the cheap, fast layer.

### What is the difference between Black Box and White Box Testing?

> **Black box testing** tests the software's functionality without any knowledge of its internal code/structure — you only care about inputs and expected outputs (from a user's perspective).

> **White box testing** tests with full knowledge of the internal code structure, logic, and paths (e.g., checking that every branch of an `if/else` is covered).

### What is Test-Driven Development (TDD)?

> A development practice where you write the (failing) test _before_ writing the actual implementation code, then write just enough code to make the test pass, then refactor — often summarized as "Red, Green, Refactor." The idea is that it forces clearer thinking about requirements upfront and naturally results in well-tested code, since tests aren't an afterthought.

### What is Regression Testing?

> Re-running existing tests after making code changes, to make sure the changes haven't accidentally broken something that used to work. It's especially important in continuously evolving codebases, and is a big reason automated test suites (rather than only manual testing) are valuable — you can't feasibly re-check everything by hand every time.

### What is Mocking and why is it used in unit tests?

> Mocking replaces a real dependency (like a database call, an external API, or a slow/complex object) with a fake, controllable stand-in during testing. It's used so unit tests can run fast, deterministically, and in isolation — without needing a real database connection or network access, and without a flaky external service causing your tests to randomly fail.

---

## 7. CI/CD & DevOps Basics.

### What is CI/CD?

> **CI (Continuous Integration)** is the practice of frequently merging code changes into a shared repository, with automated builds and tests running on every change to catch issues early.

> **CD (Continuous Delivery/Deployment)** extends this by automatically preparing (Delivery) or directly releasing (Deployment) that code to production once it passes all checks.

![CI/CD Pipeline Diagram](https://media.geeksforgeeks.org/wp-content/uploads/20260311180807372956/ci_cd_pipeline_components.webp)

### What's the difference between Continuous Delivery and Continuous Deployment?

> **Continuous Delivery** means every code change that passes automated tests is _ready_ to be released to production, but a human still manually approves/triggers the actual release.

> **Continuous Deployment** goes one step further and automatically deploys every passing change straight to production, with no manual approval step.

### Why is Continuous Integration valuable for a team?

> Without CI, developers might work in isolation for a long time before merging, leading to painful, large "merge conflicts" and integration bugs discovered late. CI catches integration issues early and often (ideally within minutes of a code change), keeping the codebase in a consistently working state and making problems much cheaper and easier to fix.

### What is DevOps and how does it relate to CI/CD?

> DevOps is a broader culture/practice that aims to unify software development (Dev) and IT operations (Ops), emphasizing automation, collaboration, and faster, more reliable releases. CI/CD is one of the core _practices_ that enables DevOps goals — it's the automated pipeline that makes frequent, reliable releases actually feasible.

### What is a Build Pipeline and what stages does it typically include?

> A build pipeline is the automated sequence of steps code goes through from commit to deployment: typically **Build** (compile/package the code) → **Test** (run automated tests) → **Static Analysis/Linting** (code quality checks) → **Deploy to Staging** → (approval, if Continuous Delivery) → **Deploy to Production**.

---

## 8. Software Design & Documentation.

### What is the difference between System Design and Software Design in this context?

> In everyday software engineering conversation, "system design" (covered in the earlier README) usually refers to the larger-scale architecture (services, databases, scaling).

> "Software design" here refers more to the practices and artifacts used to plan and communicate a system before/while building it — requirement docs, design docs, diagrams, and API specifications.

### What is a Design Document (or "Tech Spec") and why write one before coding?

> A design document outlines the problem, proposed solution, architecture, trade-offs considered, and open questions for a feature or system — written and reviewed _before_ implementation begins.

> Writing one forces you to think through edge cases and design decisions upfront, and gives teammates a chance to catch flaws or suggest improvements before significant engineering time is invested in the wrong direction.

### What is UML and is it still commonly used?

> UML (Unified Modeling Language) is a standardized set of diagram types (class diagrams, sequence diagrams, use case diagrams, etc.) used to visually represent a system's structure and behavior. Full, formal UML documentation has fallen out of common practice in most agile teams (seen as too heavyweight), but individual diagram types — especially class diagrams and sequence diagrams — are still commonly used informally to communicate design ideas.

### What is API Documentation and what should good API docs include?

> Documentation describing how to use an API — its endpoints, required parameters, expected request/response formats, authentication requirements, error codes, and usage examples. Good docs let another developer integrate with your API correctly without needing to read the underlying source code or ask you directly.

---

## 9. Code Quality & Maintainability.

### What is Technical Debt?

> Technical debt refers to the implied future cost of choosing a quick, easy solution now instead of a better, more thorough one — similar to financial debt, it "accrues interest" over time as it makes future changes harder/slower until it's "paid down" (refactored). Some technical debt is a reasonable, intentional trade-off (e.g., shipping fast to meet a deadline); the problem is when it's left unaddressed indefinitely.

### What is Refactoring and how is it different from fixing a bug?

> Refactoring means restructuring existing code to improve its internal structure, readability, or maintainability **without changing its external behavior** — the code should do exactly the same thing before and after. Fixing a bug, by contrast, deliberately _does_ change behavior (from incorrect to correct).

### What is DRY (Don't Repeat Yourself) and can you over-apply it?

> DRY is a principle encouraging you to avoid duplicating logic — instead, extract shared logic into a single, reusable place (a function, class, or module), so a change only needs to be made once. Yes, it can be over-applied — forcing two pieces of code that _happen_ to look similar right now, but represent conceptually different things, into a shared abstraction can create awkward, overly generic code that becomes harder to change later when they inevitably diverge (sometimes summarized as "premature abstraction is worse than duplication").

### What is Code Smell?

> A "code smell" is a surface-level indicator in the code that suggests a deeper problem might exist — not necessarily a bug, but a sign the code could be poorly structured (e.g., a function that's 500 lines long, deeply nested conditionals, or classes doing too many unrelated things). Smells are heuristics that prompt further investigation/refactoring, not hard rules.

### What is Code Coverage and is 100% coverage always the goal?

> Code coverage measures the percentage of your codebase that's executed by your automated test suite. 100% coverage is generally _not_ a realistic or even desirable universal goal — it's possible to have 100% coverage with weak tests that don't actually verify correct behavior (they just execute the lines), and chasing the last few % (e.g., trivial getters/setters, unreachable error handling) often isn't a good use of time compared to focusing on meaningfully testing critical logic.

---

## 10. Project Management Basics.

### What is the difference between a Product Manager and a Project Manager (as they relate to engineering)?

> A **Product Manager** focuses on _what_ should be built and _why_ — understanding user needs, prioritizing the roadmap, defining requirements. A **Project Manager** focuses on _how_ and _when_ it gets delivered — coordinating timelines, resources, and dependencies across the team to ensure the work actually ships. In many Agile teams, the Product Owner role absorbs much of the traditional Product Manager responsibilities, and the Scrum Master absorbs some traditional Project Manager responsibilities.

### What is Scope Creep and how is it managed?

> Scope creep is the gradual, often unplanned expansion of a project's requirements beyond what was originally agreed upon, without corresponding adjustments to timeline/resources. It's managed through clear requirement documentation upfront, a defined change-request process (evaluating and consciously approving new asks rather than silently absorbing them), and prioritization frameworks that force trade-off conversations when new scope is proposed.

### What is a "Definition of Done"?

> A shared, explicit checklist the team agrees defines when a piece of work is truly complete (e.g., code written, tests passing, code reviewed, documentation updated, deployed to staging) — preventing ambiguity about whether something is "actually done" or just "code complete but untested."

---

## 11. Quick Revision Cheat Sheet

| Topic               | One-line takeaway                                                          |
| ------------------- | -------------------------------------------------------------------------- |
| SDLC                | Requirement → Design → Implementation → Testing → Deployment → Maintenance |
| Waterfall           | Linear, sequential, rigid — good for fixed, well-understood requirements   |
| Agile               | Iterative, adaptive sprints — good for evolving requirements               |
| Scrum               | A concrete framework for running Agile (sprints, standups, retros)         |
| Git Merge vs Rebase | Merge preserves history (messier); rebase creates a clean, linear history  |
| Pull Request        | Mechanism for code review before merging into the main branch              |
| Testing Pyramid     | Many unit tests, fewer integration tests, fewest E2E tests                 |
| TDD                 | Write the failing test first, then the code to pass it, then refactor      |
| CI                  | Frequently merge + auto-test code to catch integration issues early        |
| CD                  | Automates release to staging/production once tests pass                    |
| Technical Debt      | Cost of quick/easy shortcuts that must eventually be "paid down"           |
| DRY                 | Avoid duplicating logic — but don't force premature abstraction            |

---
