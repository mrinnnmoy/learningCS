# List of things learned.

## HTML Fundamentals.

**HTML** stands for **Hyper Text Markup Language**.

- It is the standard markp language for creating web pages.
- It describes the structure of a Web page consisting of a series of elements.
- HTML elements tell the browser how to display the content. By labeling pieces of content such as "this is a heading", "this is a paragraph", "this is a link", etc.

### Basic Document structure.

This is how a simple html document looks.

    <!DOCTYPE html>
    <html>
    <head>
    <title>Page Title</title>
    </head>
    <body>

    <h1>My First Heading</h1>
    <p>My first paragraph.</p>

    </body>
    </html>

- The `<!DOCTYPE html>` declaration defines that this document is an HTML5 document.
- The `<html>` element is the root element of an HTML page.
- The `<head>` element contains meta information about the HTML page.
- The `<title>` element specifies a title for the HTML page (which is shown in the browser's title bar or in the page's tab).
- The `<body>` element defines the document's body, and is a container for all the visible contents, such as headings, paragraphs, images, hyperlinks, tables, lists, etc.
- The `<h1>` element defines a large heading.
- The `<p>` element defines a paragraph.

### Essential HTML Elements.

The HTML element is everything from the start tag to the end tag:

    <tagname>Content goes here...</tagname>

Example of some HTML elements:

- `<h1></h1>` : Heading.
- `<p></p>` : Paragraph.
- `<br>` : Line break.
- `<hr>` : Horizontal rule.
- `<a></a>` : Anchor tag.
- `<img>` : Image tag.

### HTML Attributes.

HTML attributes provide additional information about HTML elements.

- All HTML elements can have attributes.
- Attributes provide additional information about elements.
- Attributes are always specified in **the start tag**.
- Attributes usually come in name/value pairs like: **name="value"**.

Here are some examples:

- `<a href="https://www.google.com">Visit Google</a>` : Here `href` specifies the URL of the page the link goes to.
- `<img src="img_girl.jpg">` : Here `src` specifies the path to the image to be displayed.
- `<p style="color:red;">Hello World.</p>` : Here `style` is used to add style to an element.

### HTML Headings.

HTML headings are titles or subtitles that you want to display on a webpage.

HTML headings are defined with the `<h1>` to `<h6>` tags.

`<h1>` defines the most important heading. `<h6>` defines the least important heading.

### HTML Paragraphs.

A paragraph always starts on a new line and is usually a block of text.

The HTML `<p>` element defines a paragraph.

### HTML Text Formatting.

HTML contains several elements for defining text with a special meaning.

Formatting elements were designed to display special types of text:

- `<b>` : Bold text
- `<strong>` : Important text
- `<i>` : Italic text
- `<em>` : Emphasized text
- `<mark>` : Marked text
- `<small>` : Smaller text
- `<del>` : Deleted text
- `<ins>` : Inserted text
- `<sub>` : Subscript text
- `<sup>` : Superscript text

### HTML Quotation and Citation Elements.

- `<abbr>` : Defines an abbreviation or acronym
- `<address>` : Defines contact information for the author/owner of a document
- `<bdo>` : Defines the text direction
- `<blockquote>` : Defines a section that is quoted from another source
- `<cite>` : Defines the title of a work
- `<q>` : Defines a short inline quotation

### HTML Tables.

HTML tables allow web developers to arrange data into rows and columns.

Each table cell is defined by a `<td>` and a `</td>` tag.

Everything between `<td>` and `</td>` is the content of a table cell.

Each table row starts with a `<tr>` and ends with a `</tr>` tag.

Sometimes you want your cells to be table header cells. In those cases use the `<th>` tag instead of the `<td>` tag:

Here's an example:

    <table>
    <tr>
        <th>Person 1</th>
        <th>Person 2</th>
        <th>Person 3</th>
    </tr>
    <tr>
        <td>Emil</td>
        <td>Tobias</td>
        <td>Linus</td>
    </tr>
    <tr>
        <td>16</td>
        <td>14</td>
        <td>10</td>
    </tr>
    </table>

### HTML Lists.

HTML lists allow web developers to group a set of related items in lists.

An unordered list starts with the `<ul>` tag. Each list item starts with the `<li>` tag.

An ordered list starts with the `<ol>` tag. Each list item starts with the `<li>` tag.

### HTML Block & Inline Elements.

Every HTML element has a default display value, depending on what type of element it is.

The two most common display values are block and inline.

Here are the block-level elements in HTML:

`<address> <article> <aside> <blockquote> <canvas> <dd> <div> <dl> <dt> <fieldset> <figcaption> <figure> <footer> <form> <h1>-<h6> <header> <hr> <li> <main> <nav> <noscript> <ol> <p> <pre> <section> <table> <tfoot> <ul> <video>`

Here are the inline elements in HTML:

`<a> <abbr> <acronym> <b> <bdo> <big> <br> <button> <cite> <code> <dfn> <em> <i> <img> <input> <kbd> <label> <map> <object> <output> <q> <samp> <script> <select> <small> <span> <strong> <sub> <sup> <textarea> <time> <tt> <var>`

### HTML class Attribute.

The HTML `class` attribute is used to specify a class for an HTML element.

Multiple HTML elements can share the same class.

### HTML id Attribute.

The HTML `id` attribute is used to specify a unique id for an HTML element.

You cannot have more than one element with the same id in an HTML document.

### HTML Buttons.

Buttons let users interact with a web page. They can submit forms, run JavaScript, or trigger different actions when clicked.

The HTML `<button>` element defines a clickable button.

By itself, the button does nothing until you add an action to it.

### Semantic Elements.

Semantic elements = elements with a meaning.

A semantic element clearly describes its meaning to both the browser and the developer.

Examples of **non-semantic** elements: `<div>` and `<span>` : Tells nothing about its content.

Examples of **semantic** elements: `<img>`, `<table>` and `<article>` - Clearly defines its content.

### HTML Entities.

Reserved characters in HTML must be replaced with entities:

- &lt; (less than) : `&lt;`
- &gt; (greater than) : `&gt;`
- &copy; (copyright) : `&copy;`
- &reg; (registered trademark) : `&reg;`
- &trade; (trademark) : `&trade;`

<hr />

## Forms & Validation.

An HTML form is used to collect user input. The user input is most often sent to a server for processing.

### Form Structure.

The HTML `<form>` element is used to create an HTML form for user input:

    <form action="/submit" method="POST">
    .
    form elements
    .
    </form>

The `<form>` element is a container for different types of input elements, such as: text fields, checkboxes, radio buttons, submit buttons, etc.

### Input types.

The HTML `<input>` element is the most used form element.

An `<input>` element can be displayed in many ways, depending on the type attribute.

    <form>
    <input type="text">
    <input type="checkbox">
    <input type="button">
    </form>

Here are the different input types you can use in HTML:

- `<input type="button">`
- `<input type="checkbox">`
- `<input type="color">`
- `<input type="date">`
- `<input type="datetime-local">`
- `<input type="email">`
- `<input type="file">`
- `<input type="hidden">`
- `<input type="image">`
- `<input type="month">`
- `<input type="number">`
- `<input type="password">`
- `<input type="radio">`
- `<input type="range">`
- `<input type="reset">`
- `<input type="search">`
- `<input type="submit">`
- `<input type="tel">`
- `<input type="text">`
- `<input type="time">`
- `<input type="url">`
- `<input type="week">`

### Other Form elements.

The HTML `<form>` element can contain one or more of the following form elements:

- `<input>` : Defines an input control
- `<label>` : Defines a label for an `<input>` element
- `<select>` : Defines a drop-down list
- `<textarea>` : Defines a multiline input control (text area)
- `<button>` : Defines a clickable button
- `<fieldset>` : Groups related elements in a form
- `<legend>` : Defines a caption for a `<fieldset>` element
- `<datalist>` : Specifies a list of pre-defined options for input controls
- `<output>` : Defines the result of a calculation
- `<option>` : Defines an option in a drop-down list
- `<optgroup>` : Defines a group of related options in a drop-down list

<hr />

## CSS Fundamentals.

CSS stands for **Cascading Style Sheets**, often used to style an HTML document.

### CSS Syntax.

A CSS rule consists of a selector and a declaration block:

![img](https://www.w3schools.com/css/img_selector.gif)

    h1 {
        color: blue;
        font-size: 12px;
    }

- The selector points to the HTML element you want to style.
- The declaration block contains one or more declarations separated by semicolons.

- Each declaration includes a CSS property name and a value, separated by a colon.
- Multiple CSS declarations are separated with semicolons, and declaration blocks are surrounded by curly braces.

### Ways to Add CSS.

There are three ways of inserting a style sheet:

- External CSS : link to an external .css file
- Internal CSS : use the `<style>` element in the head section
- Inline CSS : use the style attribute on HTML elements

### CSS Selectors.

CSS selectors are used to "find" (or select) the HTML elements you want to style.

We can divide CSS selectors into five categories:

- **Simple selectors** : select elements based on name, id, class.
- **Combinator selectors** : select elements based on a specific relationship between them.
- **Pseudo-class selectors** : select elements based on a certain state.
- **Pseudo-elements selectors** : select and style a part of an element.
- **Attribute selectors** : select elements based on an attribute or attribute value.

CSS also has a **universal selector** `*` selects all HTML elements on the page.

    * {
        text-align: center;
        color: blue;
    }

<hr />

## CSS box model.

In CSS, the term "box model" is used when talking about web design and layout.

The CSS box model is essentially a box that wraps around every HTML element.

Every box consists of four parts: content, padding, borders and margins.

The image below illustrates the CSS box model:

![img](https://www.acil.in/wp-content/uploads/2021/11/boxmodel.jpg)

- **Content** : The content of the box, where text and images appear
- **Padding** : Clears an area around the content. The padding is transparent
- **Border** : A border that goes around the padding and content
- **Margin** : Clears an area outside the border. The margin is transparent

The box model allows us to add a border around elements, and to define space between elements.

<hr />

## Positioning.

CSS positioning is about controlling the placement of elements within a web page.

With CSS positioning, you can override the normal document flow.

The `position` property specifies the positioning type for an element.

This property can have one of the following values:

- `static` : This is default
- `relative` : positioned relative to its normal position in the document flow.
- `fixed` : positioned relative to the viewport, which means it always stays in the same place even if the page is scrolled.
- `absolute` : positioned relative to the nearest positioned ancestor (with position other than static).
- `sticky` : toggles between a `relative` and `fixed` position, depending on the scroll position.

Elements are then positioned to their final location with the top, bottom, left, and right properties.

### z-index.

The `z-index` property specifies the stack order of positioned elements.

The stack order defines which element should be placed in front or behind other elements.

When elements are positioned, they can overlap other elements.

<hr />

## Flexbox. (1-D Layout System)

CSS Flexbox is a layout model for arranging items (horizontally or vertically) within a container, in a flexible and responsive way.

Flexbox makes it easy to design a flexible and responsive layout, without using float or positioning.

![img](https://img.uxcel.com/cdn-cgi/image/format=auto/practices/flexbox-1665382286109/a-1665382286109-2x.jpg)

A flexbox always consists of:

- A Flex Container : The parent (container) element, where the display property is set to flex or inline-flex
- One or more Flex Items : The direct children of the flex container automatically becomes flex items

### Container Properties.

The flex container element can have the following properties:

- `display` : Must be set to flex or inline-flex
- `flex-direction` : Sets the display-direction of flex items
- `flex-wrap` : Specifies whether the flex items should wrap or not
- `flex-flow` : Shorthand property for flex-direction and flex-wrap
- `justify-content` : Aligns the flex items when they do not use all available space on the main-axis (horizontally)
- `align-items` : Aligns the flex items when they do not use all available space on the cross-axis (vertically)
- `align-content` : Aligns the flex lines when there is extra space in the cross axis and flex items wrap

### Item Properties.

The direct child elements of a flex container automatically becomes flex items.

Flex items can have the following properties:

- `order` : Specifies the display order of the flex items inside the flex container
- `flex-grow` : Specifies how much a flex item will grow relative to the rest of the flex items
- `flex-shrink` : Specifies how much a flex item will shrink relative to the rest of the flex items
- `flex-basis` : Specifies the initial length of a flex item
- `flex` : Shorthand property for flex-grow, flex-shrink, and flex-basis
- `align-self` : Specifies the alignment for the flex item inside the flex container

<hr />

## CSS Grid. (2-D Layout System)

The Grid Layout Module offers a grid-based layout system, with rows and columns.

The Grid Layout Module allows developers to easily create complex web layouts.

The Grid Layout Module makes it easy to design a responsive layout structure, without using `float` or positioning.

![img](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F7ueg2p5p21oco579y74b.jpg)

A grid always consists of:

- A Grid Container : The parent (container) element, where the display property is set to `grid` or `inline-grid`
- One or more Grid Items : The direct children of the grid container automatically becomes grid items

### Container Properties.

- `align-content` : Vertically aligns the grid items inside the container
- `align-items` : Specifies the default alignment for items inside a flexbox or grid container
- `display` : Specifies the display behavior (the type of rendering box) of an element
- `column-gap` : Specifies the gap between the columns
- `gap` : A shorthand property for the row-gap and the column-gap properties
- `grid` : A shorthand property for the grid-template-rows, grid-template-columns, grid-template-areas, grid-auto-rows, grid-auto-columns, and the grid-auto-flow properties
- `grid-auto-columns` : Specifies a default column size
- `grid-auto-flow` : Specifies how auto-placed items are inserted in the grid
- `grid-auto-rows` : Specifies a default row size
- `grid-template` : A shorthand property for the grid-template-rows, grid-template-columns and grid-areas properties
- `grid-template-areas` : Specifies how to display columns and rows, using named grid items
- `grid-template-columns` : Specifies the size of the columns, and how many columns in a grid layout
- `grid-template-rows` : Specifies the size of the rows in a grid layout
- `justify-content` : Horizontally aligns the grid items inside the container
- `place-content` : A shorthand property for the align-content and the justify-content properties
- `row-gap` : Specifies the gap between the grid rows

### Item Placement

A grid item can span over mulitiple columns or rows.

We can specify where to start and end a grid item by using the following properties:

- `grid-column-start` : Specifies on which column-line the grid item will start
- `grid-column-end` : Specifies on which column-line the grid item will end
- `grid-column` : Shorthand property for grid-column-start and grid-column-end
- `grid-row-start` : Specifies on which row-line the grid item will start
- `grid-row-end` : Specifies on which row-line the grid item will end
- `grid-row` : Shorthand property for grid-row-start and grid-row-end

The lines between the columns in a grid are called column-lines, and the lines between the rows in a grid are called row-lines.

We can refer to line numbers when placing a grid item in a grid container.

<hr />

## Responsive design.

Responsive web design is about creating web pages that look good on all devices!

A responsive web design will automatically adjust for different screen sizes and viewports.

Key components in responsive web design are:

- Viewport `<meta>` tag
- Flexible layout (grid and flex)
- Mediaqueries

### Setting the Viewport.

The viewport is the user's visible area of a web page.

The viewport varies with the device (will be a lot smaller on a mobile phone than on a computer screen).

You should include the following `<meta>` element in the `<head>` section of all your web pages:

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

This gives the browser instructions on how to control the page's dimensions and scaling.

The `width=device-width` part sets the width of the page to follow the screen-width of the device (which will vary depending on the device).

The `initial-scale=1.0` part sets the initial zoom level when the page is first loaded by the browser.

Here is an example of a web page with the viewport meta tag:

![img](https://www.w3schools.com/css/img_viewport2.png)

### Building a Grid view.

Many web pages are based on a grid-view, which means that the page is divided into rows and columns.

A responsive grid-view often has 6 or 12 columns, and will shrink and expand as you resize the browser window.

First ensure that all HTML elements have the `box-sizing` property set to `border-box`. This makes sure that the padding and border are included in the total width and height of the elements.

Add the following at the top of your CSS:

    * {
        box-sizing: border-box;
    }

<hr />

## Media Queries.

CSS media queries allow you to apply styles based on the characteristics of a device or the environment displaying the web page.

CSS media queries are essential for creating responsive web pages.

The CSS `@media` rule is used to add media queries to your style sheet.

**Typical Device Breakpoints:**

    /* Extra small devices (phones, 576px and down) */
    @media only screen and (max-width: 576px) {...}

    /* Small devices (portrait tablets and large phones, 576px and up) */
    @media only screen and (min-width: 576px) {...}

    /* Medium devices (landscape tablets, 768px and up) */
    @media only screen and (min-width: 768px) {...}

    /* Large devices (laptops/desktops, 992px and up) */
    @media only screen and (min-width: 992px) {...}

    /* Extra large devices (large laptops and desktops, 1200px and up) */
    @media only screen and (min-width: 1200px) {...}

- Media Queries for Screen Orientation.

        @media only screen and (orientation: landscape) {
            body {
                background-color: lightblue;
            }
        }

- Hide elements with Media Queries.

        /* Hide element if the viewport width is 600px or less */
        @media screen and (max-width: 600px) {
            #div1 {
                display: none;
            }
        }

<hr />

## DevTools for layout Debugging.

- [Pesticide](https://chromewebstore.google.com/detail/pesticide/bakpbgckdnepkmkeaiomhmfcnejndkbi) : A CSS debugging tool that inserts outlines onto all elements to help with debugging layout issues.
- [Wappalyzer](https://chromewebstore.google.com/detail/wappalyzer-technology-pro/gppongmhjkpfnbhagpmjfkannfbllamg) : Wappalyzer is a technology profiler that shows you what websites are built with.
- [Image Downloader](https://chromewebstore.google.com/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj) : Browse and download images on the web.
- [Responsive Viewer](https://chromewebstore.google.com/detail/responsive-viewer/inmopeiepgfljkpkidclfgbgbmfcennb) : A Chrome extension to show multiple screens in one view. the extension will help front-end developers to test multiple screens while developing responsive websites/applications.
- [What Font](https://chromewebstore.google.com/detail/what-font-font-finder/opogloaldjiplhogobhmghlgnlciebin) : Easiest way to find out which exactly font is on the page.

<hr />

## Assignment.

Build a fully responsive [VS Code](https://code.visualstudio.com/) website using only HTML & CSS. No frameworks, No JavaScript.

[Solution](./Assignment/)
