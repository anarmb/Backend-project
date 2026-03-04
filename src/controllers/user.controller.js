const User = require("../models/User.model.js");
const Post = require("../models/Post.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.js");
const cloudinary = require("../config/cloudinary.js");

const login = async (req, res) => {
    try { 
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email and/or password"});
        }
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const token = generateToken(user._id);
            return res.status(200).json({ user, token});
        } else {
            return res.status(401).json({ message: "Invalid email and/or password"});
        }
    } catch (error) { 
        return res.status(500).json({ message: "Error logging in", error });
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
        createdUser.password = undefined; 
        return res.status(201).json(createdUser);
    
    }catch (error) {
        res.status(400).json({ message: "Error creating user", error });
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
        ).populate("favs");
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: "Error adding favorite", error });
    }
};

const upgradeRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: role },
        { new: true }
    );
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(403).json({ message: "Error updating user role", error });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("posts")
            .populate("favs");
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
            if (userExists.image) {
                const imgSplit = userExists.image.split("/");
                const folderName = imgSplit[imgSplit.length - 2];
                const fileName = imgSplit[imgSplit.length - 1].split(".")[0];
                const publicId = `${folderName}/${fileName}`;
                await cloudinary.uploader.destroy(publicId);
            }
        }

        const userUpdated = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        
        return res.status(200).json({ message: "User updated successfully", data: userUpdated });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userFound = await User.findById(id);
        if (!userFound) return res.status(404).json({ message: "User not found" });

        if (userFound.image) {
            const imgSplit = userFound.image.split("/");
            const publicId = `${imgSplit[imgSplit.length - 2]}/${imgSplit[imgSplit.length - 1].split(".")[0]}`;
            await cloudinary.uploader.destroy(publicId);
        }

        const userPosts = await Post.find({ author: id });
        
        for (const post of userPosts) {
            if (post.image) {
                const imgSplit = post.image.split("/");
                const publicId = `${imgSplit[imgSplit.length - 2]}/${imgSplit[imgSplit.length - 1].split(".")[0]}`;
                await cloudinary.uploader.destroy(publicId);
            }
        }
        await Post.deleteMany({ author: id });

        await User.findByIdAndDelete(id);

        return res.status(200).json({ message: "User and related data deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

module.exports = {register, login, addFav, upgradeRole, getUser, updateUser, deleteUser};