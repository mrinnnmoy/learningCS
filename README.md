# 🧠 Learning CS.

A personal knowledge base of Computer Science fundamentals and development notes. Built for quick revision before interviews and for everyday reference at work.

## 🎯 Purpose

- Centralized notes instead of scattered docs/bookmarks
- Continuously updated as I learn new topics
- Quick interview prep reference

---

## 📂 What's Inside

| Folder                                    | Contents                  | Status         |
| ----------------------------------------- | ------------------------- | -------------- |
| `Computer-Networks`                       | Interview Q&A             | ✅             |
| `DBMS`                                    | Interview Q&A             | ✅             |
| `DevOps`                                  | —                         | 🚧 Not started |
| `DSA` (Using C++)                         | Detailed notes & problems | ✅             |
| `OOP`                                     | Interview Q&A             | ✅             |
| `Operating-Systems`                       | Interview Q&A             | ✅             |
| `Software-Engineering`                    | Interview Q&A             | ✅             |
| `System-Design`                           | Basics, Interview Q&A     | ✅             |
| `WEB-Development` (Using MERN)            | Detailed notes & problems | ✅             |
| `WEB3-Development` (SOL + ETH)            | Detailed notes & problems | ✅             |
| `Mobile-Development` (Using React Native) | —                         | 🚧 Not started |

---

## How to Contribute ⚡👋

- 🎨 Improvements are always welcome.
- 📂 Browse any folder above to find topic-wise Markdown notes.
- 💡 Most folders follow a Q&A format for quick revision.
- 👨‍💻 All code should be added under its respective learning path.
- 🔨 The DSA, Web, Web3, DevOps and Mobile folders go deeper with explanations, code examples & problem statements.

### 🔃 Steps to Make a Valid Contribution

1. Fork the [learningCS](https://github.com/mrinnnmoy/learningCS) repo using the **Fork** button at the top of the page. This creates a copy of the repository under your account.

2. **Clone the forked repository**

```bash
   git clone "https://github.com/<your-github-username>/learningCS"
```

Then set up your local environment:

- Install **Node.js v18** or higher
- Install **Git**
- Navigate into the project and install dependencies:

```bash
     cd learningCS
```

3. **Make your changes and commit them.**

   Never push directly to the `main` branch. Always switch to `develop` first:

```bash
   git checkout develop
```

Confirm you're on the right branch:

```bash
   git branch
```

It should show `* develop`.

Stage your changes:

```bash
   git add files-you-edited
```

Or, for multiple files:

```bash
   git add .
```

Write your commit message following the [Conventional Commits](https://www.conventionalcommits.org) standard:

```bash
   git commit -m "<type>: <short description>"
```

| Prefix      | Use for                                          |
| ----------- | ------------------------------------------------ |
| `feat:`     | A new feature                                    |
| `fix:`      | A bug fix                                        |
| `docs:`     | Documentation changes only                       |
| `style:`    | Formatting, missing semicolons — no logic change |
| `refactor:` | Code restructure — no feature or bug change      |
| `test:`     | Adding or updating tests                         |
| `chore:`    | Build process, dependency updates, tooling       |

Run lint and type checks before pushing — the CI pipeline will reject failing builds:

```bash
   npm run lint
   npm run typecheck
```

4. **Push your changes to GitHub.**

```bash
   git push origin develop
```

5. **Open a Pull Request 👋**

   Go to your fork on GitHub, you'll see a **Compare & pull request** button.

   Click it and summarize what you changed (attach screenshots for any UI changes).

   Once it passes all checks, I'll review and merge it. ❤️

   **Before opening a PR, make sure:**
   - [ ] `npm run lint` passes with no errors
   - [ ] `npm run typecheck` passes with no errors
   - [ ] The feature works correctly at `http://localhost:3000`, if applicable
   - [ ] You've commented on the related issue so others know it's being worked on

   **Need help?**
   - Open a [GitHub Discussion](https://github.com/mrinnnmoy/learningCS/discussions) for general questions
   - Comment directly on the issue you're working on
   - Reach out on [Twitter](https://x.com/mrinnnmoy)

---
