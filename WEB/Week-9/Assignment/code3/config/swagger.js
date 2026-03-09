const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blog API', version: '1.0.0',
            description: 'RESTful Blog API — Week 9 A3'
        },
        servers: [{ url: 'http://localhost:3003/api/v1' }],
        components: {
            schemas: {
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'My First Post' },
                        content: { type: 'string', example: 'Hello world...' },
                        author: { type: 'string', example: 'Alice' },
                        tags: { type: 'array', items: { type: 'string' } },
                        published: { type: 'boolean', example: true },
                        views: { type: 'integer', example: 142 },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreatePost: {
                    type: 'object', required: ['title', 'content', 'author'],
                    properties: {
                        title: { type: 'string' },
                        content: { type: 'string' },
                        author: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'fail' },
                        statusCode: { type: 'integer', example: 404 },
                        code: { type: 'string', example: 'POST_NOT_FOUND' },
                        message: { type: 'string', example: 'Post not found' },
                    },
                },
            },
            securitySchemes: {
                ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
            },
        },
    },
    apis: ['./routes/*.js'],
});