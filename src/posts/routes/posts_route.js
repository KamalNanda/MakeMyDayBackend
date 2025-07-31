import express from "express";
import { generate_uuid_middleware } from "../../../utilities/middlewares/generate_uuid_middleware.js";
import { add_post } from "../controllers/add_post.js";
import { fetch_all_posts } from "../controllers/fetch_all_posts.js";
import { fetch_all_posts_by_pagination } from "../controllers/fetch_all_posts_by_pagination.js";
import { fetch_post_by_id } from "../controllers/fetch_post_by_id.js";
import { fetch_tag_list } from "../controllers/fetch_tag_list.js";
import { fetch_posts_by_tag } from "../controllers/fetch_posts_by_tag.js";
import { like_post_controller } from "../controllers/like_post.js";
import { fetch_liked_posts } from "../controllers/fetch_liked_posts.js";
import { testNotification } from "../controllers/test_notification.js";

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

post_routes.get(
  "/fetch-post",
  generate_uuid_middleware(),
  fetch_post_by_id
);

post_routes.get(
  '/fetch-tags',
  generate_uuid_middleware(),
  fetch_tag_list
)

post_routes.get(
  '/fetch-posts-by-tag',
  generate_uuid_middleware(),
  fetch_posts_by_tag
)

post_routes.get(
  "/fetch-liked-posts",
  generate_uuid_middleware(),
  fetch_liked_posts
);

post_routes.post(
  "/like-post",
  generate_uuid_middleware(),
  like_post_controller
);

post_routes.post(
  "/test-notification",
  generate_uuid_middleware(),
  testNotification
);

export default post_routes;
