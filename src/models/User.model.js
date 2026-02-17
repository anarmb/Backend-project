const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    username:  {type: String, required: true, unique: true, trim: true},
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 10},
    role: { type: String, enum: ["admin", "user"], default: "user" },
    image: {type: String},
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    favs: [{type: Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;