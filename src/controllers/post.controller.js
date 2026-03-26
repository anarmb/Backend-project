const Post = require("../models/Post.model.js");
const User = require("../models/User.model.js");
const { deleteImgCloudinary } = require("../utils/deleteFile.js");

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
        const posts = await Post.find().populate("author", "username email -password");
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Error getting posts", error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id).populate("author", "username email -password");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: "Error getting post", error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postFound = await Post.findById(id);

        if (!postFound) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (req.user.role !== "admin" && postFound.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updateData = { ...req.body };

        if (req.file) {
            updateData.image = req.file.path;
            if (postFound.image) {
                await deleteImgCloudinary(postFound.image);
            }
        }

        const postUpdated = await Post.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        return res.status(200).json({ message: "Post updated", data: postUpdated });
    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
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
            await deleteImgCloudinary(post.image);
        }
        
        await Post.findByIdAndDelete(id);
        await User.findByIdAndUpdate(post.author, { $pull: { posts: id } });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

module.exports = { createPost, getAllPosts, updatePost, deletePost, getPostById };