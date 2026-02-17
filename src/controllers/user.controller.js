const User = require("../models/User.model.js");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.js");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userFound = await User.findById(id);
        if (!userFound) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.role !== "admin" && req.user._id.toString() !== id) {
            return res.status(403).json({ message: "You don't have permission to delete this user" });
        }

        if (userFound.image) {
            const imgSplit = userFound.image.split("/");
            const folderName = imgSplit[imgSplit.length - 2];
            const fileName = imgSplit[imgSplit.length - 1].split(".")[0];
            const publicId = `${folderName}/${fileName}`;

            await cloudinary.uploader.destroy(publicId);
        } 
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error });
    }
};

module.exports = {register, login, addFav, upgradeRole, getUser, deleteUser};