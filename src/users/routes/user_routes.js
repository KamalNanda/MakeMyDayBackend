import express from "express";
import { generate_uuid_middleware } from "../../../utilities/middlewares/generate_uuid_middleware.js"; 
import { upsert_user_controller } from "../controllers/upsert_user_controller.js";

const user_routes = express.Router();

user_routes.post(
  "/upsert-user",
  generate_uuid_middleware(),
  upsert_user_controller
);

export default user_routes;
