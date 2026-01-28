# List of things learned.

- **CSS.**

    CSS stands for Cascading Style Sheets. It is used to style the applications.

    You can add CSS to youtr HTML app by using

    - The `style` attribute (inline styles)

    - In an external css file.

    **Approach #1 - Inline styles.**

    Try updating the `body` tag in the last style as follows,

        <body style="background-color: black;">
        ... rest of the code
        </body>

    **Approach #2 - External styles.**

    - Add a new file called index.css

    - Add the following code in it,

            body {
                background-color: black;
            }
    
    - Update index.html

            <html>
                <title>
                    Visual Studio Code - Code Editor
                </title>
                <link rel="stylesheet" href="index.css">
            </html>
            <body>
            ... rest of the code
            </body>

        ![update-live-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fd700265f-ff95-4e7d-ab23-daf72fd2892a%2FScreenshot_2024-08-03_at_7.05.50_PM.png?table=block&id=02062b59-86a8-4f23-b7e6-65ed484bf876&cache=v2)

<hr />

- **Common Style attributes.**

    - `color` : Sets the text color.

    - `background-color` : Sets the background color.
    
    - `font-size` : Sets the size of the text.

    - `margin` : Sets the outer space around an element.

    - `padding` : Sets the inner space within an element.

    - `border` : Sets the border around an element.

<hr />

- **Flexbox**

    Flexbox is a CSS layout model designed to help with the arrangement of items within a container.

    Update the website of the following,

        <html>
            <title>
                Visual Studio Code - Code Editor
            </title>
        </html>
        <body>
            <div style="display: flex;">
                <div>Visual Studio Code</div>
                <a href="/">Docs</span> 
                <a href="/">Updates</span> 
                <a href="/">Blog</span> 
                <a href="/">API</span> 
                <a href="/">Extensions</span> 
                <a href="/">FAQs</span>
                <a href="/">Learn</span>
            </div>
            <div>
                <input type="text" placeholder="Search Docs">
                <button>Download</button>
            </div>
            <br/>

            <div>
                <a href="/">Version 1.82</a> is now available! Read about the new features and fixes from July.
            </div>

            <br/>
        </body>

    Notice that the elements are positioned right next to each other even through `Visual Studio code` is inside a `div`.

<hr />

- **Justify-content**

    Try experimenting with the `justify-content` property.

    ![flex-box-designs](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fdb20ecbb-9ab1-43cd-8184-38f9a61aeff0%2FScreenshot_2024-08-03_at_7.20.00_PM.png?table=block&id=1634f74e-bf0b-4e86-aaac-236e7ddfc16b&cache=v2)

        <html>
            <title>
                Visual Studio Code - Code Editor
            </title>
        </html>
        <body>
            <div style="display: flex; justify-content: space-between;">
                <div>Visual Studio Code</div>
                <a href="/">Docs</span> 
                <a href="/">Updates</span> 
                <a href="/">Blog</span> 
                <a href="/">API</span> 
                <a href="/">Extensions</span> 
                <a href="/">FAQs</span>
                <a href="/">Learn</span>
            </div>
            <div>
                <input type="text" placeholder="Search Docs">
                <button>Download</button>
            </div>
            <br/>

            <div>
                <a href="/">Version 1.82</a> is now available! Read about the new features and fixes from July.
            </div>

            <br/>
        </body>

    - **Another Example.**

            <html>

            </html>
            <body>
                <header>

                </header>
                <section>
                <div style="border-width: thick; border-style: solid; display: flex; justify-content: space-between; margin-left: 200px; margin-right: 200px;">
                    <div style="background: red; "> 
                        <h1>
                            Code with GitHub Copilot
                        </h1>
                        <h6>
                            Write code faster and smarter with GitHub Copilot, your AI pair programmer.
                        </h6>            
                        Try GitHub Copilot free for 30 days
                        Completions present suggestions automatically to help you code more efficiently.
                        
                        Copilot Chat understands the context of your code, workspace, extensions, settings, and more.
                        
                        Inline Chat enables you to iteratively generate edits and get answers to quick questions, directly on your code.
                    </div>
                    <div style="background: green;">
                    <img src="https://code.visualstudio.com/assets/home/swimlane-copilot.png" width="800px" /></div>
                </div>
            </section>
                <footer>

                </footer>
            </body>


<hr />

- **Classes & ids**

    In CSS, classes & Ids are used as selectors to apply styles to HTML elements.

    They help in targeting specific elements for styling and can be used to enhance the modularity and reusability of CSS code.