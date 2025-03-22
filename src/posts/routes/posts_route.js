import express from "express";
import { generate_uuid_middleware } from "../../../utilities/middlewares/generate_uuid_middleware.js";
import { add_post } from "../controllers/add_post.js";
import { fetch_all_posts } from "../controllers/fetch_all_posts.js";
import { fetch_all_posts_by_pagination } from "../controllers/fetch_all_posts_by_pagination.js";

const post_routes = express.Router();

post_routes.post(
  "/create-post",
  generate_uuid_middleware(),
  add_post
);

post_routes.get(
  "/fetch-posts",
  generate_uuid_middleware(),
  fetch_all_posts
);
post_routes.get(
  "/fetch-posts-by-pagination",
  generate_uuid_middleware(),
  fetch_all_posts_by_pagination
);




export default post_routes;
