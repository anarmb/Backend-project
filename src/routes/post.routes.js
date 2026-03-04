const { Router } = require("express");
const postRoutes = Router();
const {isAuth} = require("../middlewares/auth.js");
const upload = require("../middlewares/upload-img.js");
const { createPost, getAllPosts, updatePost, deletePost, getPostById } = require("../controllers/post.controller.js");

postRoutes.post("/", [isAuth], upload.single("image"), createPost);
postRoutes.get("/", getAllPosts);
postRoutes.get("/:id", getPostById);
postRoutes.delete("/:id", [isAuth], deletePost);
postRoutes.patch("/:id", [isAuth], upload.single("image"), updatePost);

module.exports = postRoutes;