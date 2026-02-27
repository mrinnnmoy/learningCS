# List of things learned.

## How the WEB works. (client vs Server)

### What is a client & server?

Computers connected to the internet are called clients and servers.

A simplified diagram of how they interact might look like this:

![img](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works/simple-client-server.png)

- **Clients** are the typical web user's internet-connected devices (for example, your computer connected to your Wi-Fi, or your phone connected to your mobile network) and web-accessing software available on those devices (usually a web browser like Firefox or Chrome).

- **Servers** are computers that store webpages, sites, or apps. When a client wants to access a webpage, a copy of the webpage code is downloaded from the server to the client machine, where it is rendered by the browser and displayed to the user.

### What happens when you type a URL?

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250516162618471004/browserworking11.webp)

When you type a web address (which is technically part of a URL) into your browser address bar, the following steps occur:

1. The browser goes to the DNS server and finds the real address of the server that the website lives on.

2. The browser sends an HTTP request message to the server, asking it to send a copy of the website to the client. This message, and all other data sent between the client and the server, is sent across your internet connection using TCP/IP.

3. If the server approves the client's request, the server sends the client a "200 OK" message, which means "Of course you can look at that website! Here it is", and then starts sending the website's files to the browser as a series of small chunks called packets.

4. The browser assembles the small chunks into a complete web page and displays it to you.

### DNS.

Real web addresses (URLs) aren't the nice, memorable strings you type into your address bar to find your favorite websites.

They are special numbers that look like this: `192.0.2.172`.

This is called an **IP address** and it represents a unique location on the web.

However, it's not very easy to remember, is it?

That's why the Domain Name System was invented.

This system uses special servers that match up a web address you type into your browser (like mozilla.org) to the website's real (IP) address. Large websites are commonly made available on multiple servers, so that they load efficiently for different users worldwide.

As a result, the IP address may vary depending on where you are.

### Request → Response lifecycle.

The HTTP request and response cycle is the backbone of secure communication on the web.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250705152348042640/Request-and-Response-Cycle.webp)

The client, i.e., the browser, will send an HTTP request to the server-side systems( which include a web server and database).

For Example- When you visit a website like [Google](https://www.google.com/), your browser will send an HTTP request to the server asking for the user page. The server processes this request—possibly fetching data from a database—and then sends back an HTTP response, such as an HTML page, which the browser displays to the user.

### Frontend vs Backend.

In web development, the terms frontend and backend are essential for understanding how websites and web applications work.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20251101165551067245/frontend_vs_backend.webp)

- These two components make up the core of any modern web application, each serving a unique purpose.
- Frontend is what users see and interact with on a website, like the layout, buttons, and text.
- Backend is the part that works behind the scenes, handling tasks like storing data and processing requests.

### Static vs dynamic websites.

In **Static Websites**, Web pages are returned by the server which are prebuilt source code files built using simple languages such as HTML, CSS, or JavaScript. There is no processing of content on the server (according to the user) in Static Websites. Web pages are returned by the server with no change therefore, static Websites are fast. There is no interaction with databases. Also, they are less costly as the host does not need to support server-side processing with different languages.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20201113212610/static.jpg)

In **Dynamic Websites**, Web pages are returned by the server which are processed during runtime means they are not prebuilt web pages but they are built during runtime according to the user's demand with the help of server-side scripting languages such as PHP, Node.js, ASP.NET and many more supported by the server. So, they are slower than static websites but updates and interaction with databases are possible.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20201124174728/dynamic.png)

**Dynamic Websites** are used over **Static Websites** as updates can be done very easily as compared to static websites (Where altering in every page is required) but in Dynamic Websites, it is possible to do a common change once and it will reflect in all the web pages.

<hr />

## Setting up VS Code.

### Installation guide.

- [Click here](https://code.visualstudio.com/docs/setup/setup-overview)

### Learning shortcuts.

![img](https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/KeyboardReferenceSheet.png)

### Integrated terminal.

- [Getting started with the terminal](https://code.visualstudio.com/docs/terminal/getting-started)

### Extensions:

- [Extension-Marketplace](https://marketplace.visualstudio.com/VSCode)
- [Extension-Marketplace-Docs](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace)

#### Some useful extensions for daily usage.

- [CodeSnap](https://marketplace.visualstudio.com/items?itemName=adpyke.codesnap)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- [Markdown Preview](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)

### Basic debugger overview.

[Debug code with Visual Studio Code](https://code.visualstudio.com/docs/debugtest/debugging)

<hr />

## Browser DevTools.

Every web-developer needs some basic set of tools for understanding the underlying structure of the code and enables us to inspect the web content.

**Developer tools** are built directly into the browser.

These are the tools that are browser dependent.

Most of these tools are common among various browsers and do a range of things, from inspecting elements of a currently-loaded HTML, CSS, and JavaScript.

With developer tools, we can directly interact with the source code that is fetched into the client side of our system.

### How to open DevTools in the browser.

To access the DOM or CSS of the webpage, **right-click** the desired element on the page and select Inspect.

#### Inspector.

The Inspector tool allows you to see the HTML, CSS of the webpage that you are currently inspecting.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20210107200845/art3f3-660x283.png)

It allows users to:

- View and change the DOM/ CSS,
- Inspect and change HTML Pages,
- Inspect animations &
- Find unused CSS.

These changes are not permanent and are reset once you refresh the browser window.

#### Console.

The console is used for debugging JavaScript present in the source code of the webpage.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20210108202916/art3f4-660x537.png)

It allows users to:

- View logged messages,
- Run JavaScript,
- Preserve Log,
- Group similar elements,
- Log XmlHttpRequests &
- Preserve live expression.

The console reports the errors which are encountered by the browser as it tries to execute the code.

#### Network Monitor.

A Network panel is used to make sure what all resources that are being downloaded or uploaded are being done as expected.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20210109015905/art3f6-660x256.png)

It allows users to:

- Inspect the properties of an individual resource (HTTP headers, content, size),
- Check Network request list,
- View Network traffic recording,
- Create Performance analysis,
- Inspect web sockets,
- Inspect server-sent events &
- To throttle the network speed.

<hr />
