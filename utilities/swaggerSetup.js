import swaggerJsdoc from "swagger-jsdoc";
// import { configs } from "../configuration/config.js";

const options = {
  swaggerDefinition: {
    openapi: "3.0.3",
    info: {
      title:
        "API Documentation for MakeMyDay Application",
      version: "1.0",
      contact: {
        name: "Kamal Nanda",
        email: "kamalnanda20@gmail.com",
      },
    }, 
    tags: [ 
      {
        name: "Health Check",
        description: "API to health check",
      }, 
      {
        name: "Posts",
        description: "API for Posts",
      },
    ],
  },
  apis: [
    "./server.js", 
    "./src/posts/controllers/add_post.js",
    "./src/posts/controllers/fetch_all_posts.js"
  ],
};

const specs = swaggerJsdoc(options);

export default specs;

/**
 *@swagger
 *  components:
 *    schemas:
 *      StandardErrorResponse:
 *        description: Response if authorization failed
 *        type: object
 *        properties:
 *          status:
 *            type: boolean
 *            description: Status
 *          message:
 *            type: string
 *            description: Message
 *      PostgrestPrimaryKeyViolatesErrorResponse:
 *        type: object
 *        description: Response if authorization failed
 *        properties:
 *          code:
 *            type: string
 *            description: error code
 *          detail:
 *            type: String
 *            description: detail
 *          hint:
 *            type: String
 *            description: hint
 *          message:
 *            type: string
 *            description: Message
 *    securitySchemes:
 *      DashboardToken:
 *        description: Use the token recieved after User Sign-in API
 *        type: http
 *        scheme: bearer
 *        bearerFormat: JWT
 */
