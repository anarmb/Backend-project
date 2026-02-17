const express = require("express");
const postRoutes = express.Router();
const {isAuth} = require("../middlewares/auth.js");
const upload = require("../middlewares/upload-img.js");
const { createPost, getAllPosts, deletePost, getPostById } = require("../controllers/post.controller.js");

postRoutes.post("/", [isAuth], upload.single("image"), createPost);
postRoutes.get("/", getAllPosts);
postRoutes.get("/:id", getPostById);
postRoutes.delete("/:id", [isAuth], deletePost);

module.exports = postRoutes;