import swaggerJsdoc from "swagger-jsdoc";
// import { configs } from "../configuration/config.js";

const options = {
  swaggerDefinition: {
    openapi: "3.0.3",
    info: {
      title: "MakeMyDay API",
      version: "1.0",
      description: "API documentation for the MakeMyDay backend.",
      contact: {
        name: "Kamal Nanda",
        email: "kamalnanda20@gmail.com",
      },
    }, 
    tags: [ 
      {
        name: "Posts",
        description: "API for Posts",
      },
      {
        name: "User",
        description: "API for Users",
      },
      {
        name: "Messages",
        description: "API for Contact Me",
      },
    ],
  },
  apis: ["./src/**/controllers/*.js", "./utilities/swaggerSetup.js"],
};

const specs = swaggerJsdoc(options);

export default specs;

/**
 *@swagger
 *  components:
 *    schemas:
 *      StandardErrorResponse:
 *        description: Standard API error response
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
 *        description: Database constraint error response
 *        properties:
 *          code:
 *            type: string
 *            description: error code
 *          detail:
 *            type: string
 *            description: detail
 *          hint:
 *            type: string
 *            description: hint
 *          message:
 *            type: string
 *            description: Message
 */
