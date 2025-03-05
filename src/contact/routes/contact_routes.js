import express from "express";
import { generate_uuid_middleware } from "../../../utilities/middlewares/generate_uuid_middleware.js"; 
import { add_message } from "../controllers/add_message.js";
import { fetch_messages } from "../controllers/fetch_messages.js";

const contact_routes = express.Router();

contact_routes.post(
  "/add-message",
  generate_uuid_middleware(),
  add_message
);

contact_routes.get(
  "/fetch-messages",
  generate_uuid_middleware(),
  fetch_messages
);


export default contact_routes;
