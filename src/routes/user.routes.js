const express = require("express");
const userRoutes = require("express").Router();
const { register, login, addFav, upgradeRole, getUser, deleteUser } = require("../controllers/user.controller.js");
const upload = require("../middlewares/upload-img.js");
const { isAuth, isAdmin } = require("../middlewares/auth.js");

userRoutes.post("/register", upload.single("image"), register);
userRoutes.post("/login", login);
userRoutes.delete("/delete/:id", [isAuth], deleteUser);
userRoutes.patch("/add-fav/:postId", [isAuth], addFav);
userRoutes.patch("/upgrade/:userId", [isAuth, isAdmin], upgradeRole);
userRoutes.get("/get", [isAuth], getUser);

module.exports = userRoutes;