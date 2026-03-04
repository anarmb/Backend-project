const { Router } = require("express");
const userRoutes = Router();
const { register, login, addFav, upgradeRole, getUser, updateUser, deleteUser} = require("../controllers/user.controller.js");
const upload = require("../middlewares/upload-img.js");
const { isAuth, isAdmin } = require("../middlewares/auth.js");

userRoutes.post("/register", upload.single("image"), register);
userRoutes.post("/login", login);
userRoutes.delete("/delete/:id", [isAuth], deleteUser);
userRoutes.patch("/add-fav/:postId", [isAuth], addFav);
userRoutes.patch("/upgrade/:userId", [isAuth, isAdmin], upgradeRole);
userRoutes.get("/get", [isAuth], getUser);
userRoutes.patch("/update/:id", [isAuth], upload.single("image"), updateUser);

module.exports = userRoutes;