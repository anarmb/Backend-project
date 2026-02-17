require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("../models/Post.model");
const User = require("../models/User.model"); 
const postsData = require("../data/allposts");

mongoose
    .connect(process.env.DB_URL)
    .then(async () => {
        console.log("Connecting with database...");

        const allPosts = await Post.find();
        if (allPosts.length) {
            await Post.collection.drop();
            console.log("Post collection deleted");
        }

        await User.updateMany({}, { $set: { posts: [] } });
        console.log("Users' posts arrays cleared");
    })
    .catch((error) => console.error("Error cleaning database:", error))
    .then(async () => {
        await Post.insertMany(postsData);
        console.log("Posts inserted successfully");
    })
    .catch((error) => console.error("Error inserting posts:", error))
    .finally(() => {
        console.log("Disconnecting from database...");
        mongoose.disconnect();
    });