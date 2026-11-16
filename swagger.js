const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Administration API",
    description: "API documentation for Administration project",
  },
  host: "localhost:8000",
  basePath: "/api/v1",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter your bearer token in the format **Bearer <token>**",
    },
  },
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/api/index.js"];

swaggerAutogen(outputFile, routes, doc);
