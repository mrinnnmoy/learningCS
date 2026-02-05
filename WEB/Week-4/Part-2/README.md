# List of things learned.

## **Why the HTTP Protocol?**

![example-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fb9784147-4172-4618-b490-ef5adca0ed69%2FScreenshot_2024-08-25_at_6.12.18_PM.png?table=block&id=60374b7f-402a-4710-9b86-25a0dc4de8ed&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

Back in the day, HTTP was introduced so machines all around the world could talk to each other.

This would be useful for things like

- Talking via im(instant messenger)
- Emails
- Accessing an `algorithm` that is only available on a `very big machine` at `stanford` lets say

Slowly the HTTP was formalised and now spec'd out [here](https://datatracker.ietf.org/doc/html/rfc2616).

### **Mini assignments.**

Try exploring the network tab and seeing all the HTTP requests that go out when you visit `https://google.com`

![assignment-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F870e6185-9adf-4e8f-bd93-681c59d2031c%2FScreenshot_2024-08-25_at_7.27.11_PM.png?table=block&id=b5d2d73b-e453-4daa-9ff9-6b8b09dcaafe&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Request Response Model.**

The request-response model is a fundamental communication pattern.

It describes how data is exchanged between a `client` and a `server` or between two system.

![model-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fb13d2386-490a-4a55-9518-79bd4f4097bf%2FScreenshot_2024-08-25_at_6.35.30_PM.png?table=block&id=e3f0ee98-92ab-44f9-844d-eae43e674cf5&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

**Are there other ways for you to communicate b/w machines?**

Yes, there are various other protocols that exist that let machines communicate with each other.

- Websockets
- webRTC
- gRPC & more.

<hr />

## **Domain name/IP.**

The way to reach a server is through it's `Domain name`.

For example:

- google.com
- youtube.com
- twitter.com

Whereas, every domain you see, actually has an underlying IP that it `resolves` to.

You can check the ip by running the `ping` command.

    ping google.com

So, when you try to visit a website, you're actually visiting the `underlying IP address`.

<hr />

## **Ports.**

In networking, ports are `logical` endpoints used by protocols to identify `specific processes` running on a computer or server.

They help direct network traffic to the correct application or service on a system.

![ports-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F2738d1a0-7b04-4aab-8434-ab2530526606%2FScreenshot_2024-08-25_at_7.08.18_PM.png?table=block&id=8c0c9835-9a62-46c1-8864-72600676de1f&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Methods**

HTTP methods are used to specify the type of action that the client wants to perform on a resource on the server.

Some commonly used methods:

- **GET** : Retrieve data from a server.
- **POST** : Submit data to be processed by a server.
- **PUT** : Update or create a resource on the server.
- **DELETE** : Remove a resource from the server.

![methods-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fec64dee0-5421-4d18-9d83-eea77de95fa5%2FScreenshot_2024-08-25_at_7.13.12_PM.png?table=block&id=056dc99c-ad93-4a09-a404-3ae03162c9f9&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=1360&userId=&cache=v2)

<hr />

## **Response.**

The response represents what the server returns you `in response` to the request.

It could be

- Plaintext data : Not used as often
- HTML : If it's a website
- JSON data : If you want to fetch some data

### **JSON**

JSON stands for **JavaScript Object Notation**.

It's a lightweight, text-based format used for data interchange.

    {
    "name": "John Doe",
    "age": 30,
    "isEmployed": true,
    "address": {
        "street": "123 Main St",
        "city": "Anytown"
    },
    "phoneNumbers": ["123-456-7890", "987-654-3210"]
    }

![JSONdata-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F572d75ba-6ea7-4e90-b572-f9b8edf75b44%2FScreenshot_2024-08-25_at_7.17.28_PM.png?table=block&id=c49e7ffe-a419-401e-b3ef-844cddfe4638&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Status Codes.**

HTTP status codes are three-digit numbers returned by a server to indicate the outcome of a client’s request. They provide information about the status of the request and the server's response.

### **200 series (Success)**

- **200 OK**: The request was successful, and the server returned the requested resource.
- **204 No Content**: The request was successful, but there is no content to send in the response

### **300 series (Redirection)**

- **301 Moved Permanently**: The requested resource has been moved to a new URL permanently. The client should use the new URL provided in the response.
- **304 Not Modified**: The resource has not been modified since the last request. The client can use the cached version.

### **400 series (Client Error)**

- **400 Bad Request**: The server could not understand the request due to invalid syntax.
- **401 Unauthorized**: The request requires user authentication. The client must provide credentials.
- **403 Forbidden**: The server understood the request but refuses to authorize it.
- **404 Not Found**: The requested resource could not be found on the server.

### **500 series (Server Error)**

- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.
- **502 Bad Gateway**: The server received an invalid response from an upstream server while acting as a gateway or proxy.

![img1](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fbd05a244-5b3c-4e04-a02f-3f8a3895e9a5%2FScreenshot_2024-08-25_at_7.22.50_PM.png?table=block&id=a6608157-50af-4150-a911-16feb2655bef&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Body**

In HTTP communications, the **body** (or **payload**) refers to the part of an HTTP message that contains the actual data being sent to the server.

It is usually `JSON` data that is transferred to the server.

For example -

    {
        todo: "Go to the gym"
    }

![body-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F9ea5f606-27f2-44b0-8f14-4f986886ee59%2FScreenshot_2024-08-25_at_7.23.43_PM.png?table=block&id=0957cb05-1316-4091-948d-929820479fbb&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Routes**

In the context of HTTP, routes are paths or endpoints that define how incoming requests are handled by a server. Routing is a mechanism used to direct incoming HTTP requests to the appropriate handler functions or resources based on the URL path.

![routes-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F4b894187-d09c-4421-b3ec-e5376829c905%2FScreenshot_2024-08-25_at_7.26.18_PM.png?table=block&id=3aeebf8e-ffcf-4022-a85a-f7c45211a628&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=980&userId=&cache=v2)

<hr />

## **Headers**

HTTP headers are key-value pairs included in HTTP requests and responses that provide `metadata` about the message. 

### **Why not use body?**

Even though you can use body for everything, it is a good idea to use `headers` for sending data that isn’t directly related with the `application logic`.

For example, if you want to create a new TODO, you will send the TODO payload in the body

    {
        description: "Go to the gym"
    }

But the `Authorization` information in the `headers`

    Authorization: mrinmoy

<hr />

Well i hope now, we understand the followings.

![constructs-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F158d74b0-4846-45f6-9ba6-36e10d1de6fb%2FScreenshot_2024-08-25_at_7.27.11_PM.png?table=block&id=eba95286-b96f-4707-b173-735049840c62&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

## **Clients**

Postman lets you send HTTP requests to a server, just like your browser. It gives you a prettier interface to send requests and play with them.

You can send a request from various `clients` , Postman being one of them.

[Installing postman](https://www.postman.com/downloads/)

**curl**
![curl-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fbf995ef4-87ed-4949-bcd6-ba9f93f168b3%2FScreenshot_2024-08-25_at_7.29.25_PM.png?table=block&id=0e18db22-4954-432c-b86f-9cdf138e2489&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

**Browser**
![Browser-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fb0485664-aca5-4d44-bb09-9db58f0a7394%2FScreenshot_2024-08-25_at_7.29.51_PM.png?table=block&id=ab8450a1-acf7-499f-ae1f-5d9a95a02526&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

**Postman**
![postman-img](https://petal-estimate-4e9.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fc9111143-d8d4-4747-87f0-e473d4cacf73%2FScreenshot_2024-08-25_at_7.30.12_PM.png?table=block&id=f9fb51b4-6a2d-423f-9161-f74e7d53c766&spaceId=085e8ad8-528e-47d7-8922-a23dc4016453&width=950&userId=&cache=v2)

<hr />

## **Writing HTTP code in JS.**

**Hint**: Try using [**express**](http://npmjs.com/package/express).

[Solution](./practise/)

<hr />

## **Assignment.**

1. Try to code an in memory todo app.
2. Try to code a filesystem based todo app.