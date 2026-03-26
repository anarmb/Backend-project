const User = require("../models/User.model.js");
const Post = require("../models/Post.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.js");
const { deleteImgCloudinary } = require("../utils/deleteFile.js");


const login = async (req, res) => {
    try { 
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email and/or password"});
        }
        
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const token = generateToken(user._id);
            
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;
            
            return res.status(200).json({ user: userWithoutPassword, token });
        } else {
            return res.status(401).json({ message: "Invalid email and/or password"});
        }
    } catch (error) { 
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const newUser = new User(req.body);
        newUser.role = "user";
        if (req.file) {
            newUser.image = req.file.path;
        }
        newUser.password = bcrypt.hashSync(newUser.password, 10);

        const createdUser = await newUser.save();
        
        const userResponse = createdUser.toObject();
        delete userResponse.password;
        
        return res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: "Error creating user", error: error.message });
    }
};

const addFav = async (req, res) => {
    try { 
        const { postId } = req.params;
        const userId = req.user._id;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favs: postId } },
            { new: true }
        ).populate("favs").select("-password");
        
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: "Error adding favorite", error: error.message });
    }
};

const upgradeRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true }
        ).select("-password");

        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(403).json({ message: "Error updating user role", error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("posts")
            .populate("favs")
            .select("-password");
            
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdToken = req.user._id.toString();

        if (req.user.role !== "admin" && userIdToken !== id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const userExists = await User.findById(id);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }

        if (req.user.role !== "admin") {
            delete updateData.role;
        }

        if (req.file) {
            updateData.image = req.file.path;
            if (userExists.image) await deleteImgCloudinary(userExists.image);
        }

        const userUpdated = await User.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true }
        ).select("-password");
        
        return res.status(200).json({ message: "User updated successfully", data: userUpdated });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdToken = req.user._id.toString();

        if (req.user.role !== "admin" && userIdToken !== id) {
            return res.status(403).json({ message: "Forbidden: You cannot delete other users" });
        }

        const userFound = await User.findById(id);
        if (!userFound) return res.status(404).json({ message: "User not found" });

        if (userFound.image) await deleteImgCloudinary(userFound.image);

        const userPosts = await Post.find({ author: id });
        for (const post of userPosts) {
            if (post.image) await deleteImgCloudinary(post.image);
        }
        
        await Post.deleteMany({ author: id });
        await User.findByIdAndDelete(id);

        return res.status(200).json({ message: "User and related data deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

module.exports = { register, login, addFav, upgradeRole, getUser, updateUser, deleteUser };