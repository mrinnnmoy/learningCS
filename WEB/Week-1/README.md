# List of things learned.

## Bash & Terminal.

### What is a Shells?

A shell is a text-based interface that lets you talk to your computer.

There are different shells, but **Bash** (Bourne Again SHell) is the most popular because it's powerful and easy to use.

### Types of shells.

- **Bourne Shell (sh)**: The original Unix shell, developed by Stephen Bourne.
- **C Shell (csh)**: Known for its C-like syntax, popular for interactive use.
- **Korn Shell (ksh)**: Combines features of sh and csh, offering advanced scripting capabilities.
- **Bash (Bourne Again SHell)**: An improved version of sh, with additional features like command history and tab completion.

### What is Bash?

Bash is used to write scripts and run commands on Unix/Linux systems.

Bash is the default shell on most Linux and macOS systems.

It helps automate tasks, manage system operations and boost productivity.

### Why use Bash?

- It is widely available on Unix/Linux systems, making scripts portable.
- Supports powerful scripting features, including loops, conditionals and functions.
- Provides command history and tab completion for ease of use.
- Can be integrated with other Unix/Linux tools for automation.

### Practical uses of Bash.

- System administrators use Bash to:
  - Automate tasks,
  - System operations,
  - Process data.

- Developers use Bash for:
  - Build automation,
  - Testing,
  - Deployment,
  - Data processing & manipulation.

### Setting up Bash.

Most Unix/Linux systems come with Bash pre-installed.

- To check if Bash is installed, open a terminal and type: `bash --version`.

If Bash isn't installed, you can install it using your system's package manager.

- For Ubuntu/Debian, type `sudo apt-get install bash`
- On macOS, you can install Bash via Homebrew, type `brew install bash`
- On Windows, you can use WSL (Windows Subsystem for Linux) to run Linux or just use Git Bash for Windows.

### Bash Commands.

Bash commands are how you interact with the operating system and perform tasks.

Common commands:

- `ls` : List directory contents
- `cd` : Change the current directory
- `pwd` : Print the current working directory
- `echo` : Display a line of text
- `cat` : Concatenate and display files
- `cp` : Copy files and directories
- `mv` : Move or rename files
- `rm` : Delete files or folders
- `touch` : Create an empty file or update its time
- `mkdir` : Create a new folder

All of this commands also has a variety of options in itself to customize its output.

<hr />

## Git.

Git is a popular distributed version control system.

It was created by **Linus Torvalds** in 2005 and has been maintained by **Junio Hamano** since then.

It's used to:

- save and manage different versions of your files and code.
- work with others, keep track of changes and undor mistakes.

### Installation Guide.

You can [download](git-scm.com) Git for free.

- Windows : Download and run the installer. This will install Git and Git Bash.

- macOS: Using Homebrew, open Terminal and type `brew install git`.

- Linux : Open the terminal and use your package manager. For example, on Ubuntu: `sudo apt-get install git`.

During/after installation, set VS Code as default editor & add Git to PATH Environment.

### Git Config.

Now let Git know who you're.

- `git config --global user.name "Mrinmoy Porel"` : To attach your name to your commits.
- `git config --global user.email "mrinmoy202000@gmail.com"` : To attach your email to your commits.

### Key Git concepts.

- **Repository** : A folder where Git tracks your project and it's history.
- **Clone** : Make a copy of a remote repository on your computer.
- **Stage** : Tell Git which changes you want to save next.
- **Commit** : Save a snapshot of your staged changes.
- **Branch** : Work on different versions or features at the same time.
- **Merge** : Combine changes from different branches.
- **Merge Conflict** : A merge conflict happens when changes in two branches touch the same part of a file and Git doesn't know which version to keep.
- **Pull** : Get the lastest changes from a remote repository.
- **Push** : Send your changes to a remote repository.
- **Tag** : A tag is like a label or bookmark for a specific commit. often used to mark important points in your project history, like releases (v1.0 or v2.0).
- **Stash** : Sometimes you need to quickly switch tasks or fix a bug, but you're not ready to commit your work. Stash lets you save your uncommitted changes and return to a clean working directory.

### Steps for working with Git.

1. Initialize Git on a folder, making it a **Repository**.
2. Git now creates a hidden folder to keep track of changes in that folder.
3. When a file is changed, added or deleted, it is considered **modified**
4. You select the modified files you want to **Stage**.
5. The **Staged** files are **Committed**, which prompts Git to store a **permanent** snapshot of the files.
6. Git allows you to see the full history of every commit.
7. You can revert back to any previous commit.
8. Git does not store a separate copy of every file in every commit, but keeps track of changes made in each commit!

### Git commands.

- Verify your installation : `git --version`.
- List all Git commands : `git help --all`.
- Initialize Git on that folder : `git init`.
- Creating a new branch : `git branch <branchName>`.
- Listing all branches : `git branch`.
- Switching between branches : `git checkout <branchName>`.
- To delete a branch : `git branch -d <branchName>`.
- To rename an old branch : `git branch -m old-name new-name`.
- To merge a branch : `git merge branchName`.
- Check which files are tracked : `git status`.
- To add a file to the staging area : `git add <file>`.
- Stage all changes at once : `git add -A`.
- Un-Stage a file : `git restore --staged <file>`.
- Commit staged changes with a message : `git commit -m "message"`.
- To check commit history : `git log`.
- See unstaged changes : `git diff`.
- See staged changes : `git diff --staged`.
- Create a lightweight tag : `git tag <tagname>`.
- Tag a specific commit : `git tag <tagname> <commit-hash>`.
- List tags : `git tag`.
- Show tag details : `git show <tagname>`.
- Push tag to Remote : `git push origin <tagname>`.
- Stash your changes : `git stash`.
- Stash with a message : `git stash push -m "message"`.
- List all stashes : `git stash list`.
- Create a branch from a stash : `git stash branch <branchname>`.
- Merge a branch into your current branch : `git merge`.
- Always create a merge commit : `git merge --no-ff`.
- Combine changes into a single commit : `git merge --squash`.
- Abort a merge in progress : `git merge --abort`.

## Github.

GitHub is a cloud-based platform for hosting Git repositories.

It enables:

- Collaboration,
- Code reviews,
- Issue tracking &
- Pull requests.

### Getting Started.

The first steps of using Github for version control and collaboration are:

1. Sign up for Github : Go to [Github.com](https://www.github.com/) and create a free account.

2. Create a repository : After signing in, click the **New** button to create a new repository.

   Fill in the repository details.

### Github Flow.

The GitHub Flow is a simple, effective workflow for collaborating on code using Git and GitHub.

It helps teams work together smoothly, experiment safely, and deliver new features or fixes quickly.

Here's how the GitHub Flow works, step by step:

- **Create a Branch**: Start new work without affecting the main code.
- **Make Commits**: Save progress as you make changes.
- **Open a Pull Request**: Ask others to review your work.
- **Review**: Discuss and improve the changes together.
- **Deploy**: Test your changes before merging.
- **Merge**: Add your finished work to the main branch.

### Basic commands.

Commands for combine use of Git & Github.

- Downloads new data from a remote repository, but does not change your working files or branches. : `git fetch`.
- Combination of `fetch` & `pull`. When working as a team on a project, it is important that everyone stays up to date : `git pull`.
- Used to create a local copy of a target repository : `git clone <repoURL>`.
- Uploads your local commits to Github after the use commits the changes : `git push origin`.
- Revert the latest commit : `git revert HEAD`.
- Revert a specific commit : `git revert <commit>`.

This workflow is designed to be easy for beginners and powerful for teams of any size.
