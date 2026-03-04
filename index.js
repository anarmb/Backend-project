require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db.js");
const cloudinary = require("./src/config/cloudinary.js");
const userRoutes = require("./src/routes/user.routes.js");
const postRoutes = require("./src/routes/post.routes.js");

const app = express();

/*Conexión a la BD*/
connectDB();

/*Middlewares*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*Rutas*/
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);

/*Posibles errores*/
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

/*Levantar servidor*/
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
