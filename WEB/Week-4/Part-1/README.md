# List of things learned.

## **What is Node.js?**

Node.js is an open-source `JS runtime` that allows you to execute JavaScript code on the server side.

It's built on chrome's V8 JavaScript engine.

[NodeJS-repo](https://github.com/nodejs/node)

- **Runtime.**

  The environment where JS code is executed. It could be
  - On the server
  - In the browser
  - On a small watch

- **V8 Engine.**

  The V8 engine is an open-source JS engine developed by Google.

  It is used to execute JS code in various environments, most notably in the Google Chrome web browser.

  ![JS-V8-Engine](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fab1fe086-6a78-4046-8e8e-5343b1aa3a7e%2FScreenshot_2024-08-24_at_4.48.38_PM.png?table=block&id=2b85778e-b478-4b89-bb49-2b3d98fa4790&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

  Mozilla has their own JS engine - **SpiderMonkey**

  Safari - **JavaScriptCOre**

- **Installing Node.js**

  [](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04)
  - Build from source
  - Using a package manager (brew, chocolat)
  - Using nvm

  If you're on windows, download `git bash` at the very least.

<hr />

## **What is bun?**

Like Node.js, Bun is a JS runtime that allows you to execute JS code on the server side.

![bun-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F451bad42-c5a0-4b31-82ff-3107b460cae9%2FScreenshot_2024-08-24_at_5.30.55_PM.png?table=block&id=89c266a2-f3f4-48d7-b5a2-021dc731a268&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

- **Installing bun.**

  Linux

        curl -fsSL https://bun.sh/install | bash

  Mac

        powershell -c "irm bun.sh/install.ps1 | iex"

<hr />

## **Starting a Node.js project**

To `initialize` a Node.js project locally, run the following command.

    npm init -y

- Exploring `package.json`

    ![package.json-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F1d7885bf-e74d-4297-808e-aa6daaf2cb19%2FScreenshot_2024-08-24_at_6.22.45_PM.png?table=block&id=6139060c-f721-40cf-9c63-5954ec9c1750&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

- writing some code

        let firstName = "Mrinmoy";
        console.log(firstName);

- Run the code.

        node index.js

- Add a `script` in `package.json`

        "scripts": {
            "start": "node index.js"
        },

- Run `npm run start`

<hr />

## **npm**

The full form of NPM is **Node Package Manager**.

It is a package manager for JS, primarily used for managing libraries and dependencies in Node.js projects.

NPM allows developers to easily install, update and manage packages of reusable code.

For example, the `package manager` for rust is `cargo`. Similar to `npm` for JavaScript.

Uses of `npm`:

- Initializing a project.

        npm init

- Running scripts.

        npm run test

- Installing external dependencies.

        npm install chalk

- Write some code.

        const chalk = require(chalk);

        console.log(chalk.blue("Hello, world!"));
        console.log(chalk.red.bold("This is an error message."));
        console.log(chalk.green.underline("This is success message."));

<hr />

## **Internal packages**

Node.js provides you some `packages` out of the box. Some common ones include

- fs : FileSystem
- path : Path related functions
- http : Create HTTP servers

### **fs package**

The fs (FileSystem) package is used to read, write, update contents on the fileSystem.

    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(__dirname, 'a.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
    });

Why use the `path` library?

1. Cross platform joins (Windows has Users\mrin\dir , linux has Users/mrin/dir)
2. Gives you a bunch of helper functions (dirname)
3. Normalises paths (Converts `/Users/mrin/Projects/../../code1` to `/Users/mrin/Projects`

<hr />

## **External packages**

These are packages written and maintained by other people. You just use their work in your project.

For example:

- Express
- chalk

You can read more about them on their [npm page](https://www.npmjs.com/package/chalk).

Sometimes they are open-source as well, [chalk](https://github.com/chalk/chalk).

### **Semantic Versioning Format.**

Every external package is updated incrementally. A specific version looks something like follows:

    "chalk": "^5.3.0"

This format is as follows - `MAJOR.MINOR.PATCH`

- MAJOR : Major version changes indicate significant updates or breaking changes.

- MINOR : Minor version changes signify the addition of new features or improvements in a backward-compatible manner.

- PATCH : Patch version changes include backward-compatible bug fixes or minor improvments that address issues without adding new features or causing breaking changes.

### **Usage in `package.json`**

- `“chalk”: “^5.3.0”` : npm will install any version that is compatible with `5.3.0` but less than `6.0.0`. This includes versions like `5.3.1`, `5.4.0`, `5.5.0`, etc.

- `“chalk”: “5.3.0”` : Will install the exact version

- `"chalk": "latest"` : Will install the latest version

<hr />

## **package-lock.json**

The `package-lock.json` records the exact versions of all dependencies and their dependencies (sub-dependencies) that are installed at the time when `npm install` was run.

- **Consistency** : By locking down these versions, `package-lock.json` ensures that every time someone installs dependencies (e.g., by running `npm install`), they get the exact same versions of packages.

    This prevents discrepancies that can arise from different versions being installed in different environments.

<hr />

## **Assignments.**

- **Problem #1**

    Create a `command line interface` that lets the user specify a file path and the nodejs process counts the number of words inside it.

    **Hint**: Use this library, [commander](https://www.npmjs.com/package/commander).

        Input - node index.js /Users/kirat/file.txt
        Output - You have 10 words in this file

- **Problem #2**

    FileSystem based todo list.

    Create a `cli` that lets a user,
    
    - add a todo
    - delete a todo
    - mark a todo as done

    Store all the data in files, `todos.json`.