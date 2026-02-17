const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to database");
    }catch (error) {
        console.error("Cannot connect to database", error);
    }
};

module.exports =  {connectDB };