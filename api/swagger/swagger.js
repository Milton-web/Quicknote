const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swing Notes API',
      version: '1.0.0',
      description: 'API för att hantera anteckningar',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(options);
