const Post = require("../models/Post.model.js");
const User = require("../models/User.model.js");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);

        if (req.file) {
            newPost.image = req.file.path;
        }

        newPost.author = req.user._id;
        const createdPost = await newPost.save();

        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { posts: createdPost._id } },
            { new: true }
        );

        return res.status(201).json(createdPost);

    } catch (error) {
        return res.status(500).json({ message: "Error creating post", error: error.message });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username email");
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Error getting posts", error });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id).populate("author", "username email");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: "Error getting post", error });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (req.user.role !== "admin" && post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You don't have permission to delete this post" });
        }

        if (post.image) {
            const imgSplit = post.image.split("/");
            const folderName = imgSplit[imgSplit.length - 2];
            const fileName = imgSplit[imgSplit.length - 1].split(".")[0];
            const publicId = `${folderName}/${fileName}`;
            
            await cloudinary.uploader.destroy(publicId);
        }
        
        await Post.findByIdAndDelete(id);
        await User.findByIdAndUpdate(post.author, { $pull: { posts: id } });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting post", error });
    }
};

module.exports = { createPost, getAllPosts, deletePost, getPostById }