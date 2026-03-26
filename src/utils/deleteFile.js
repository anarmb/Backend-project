const cloudinary = require("../config/cloudinary.js");

const deleteImgCloudinary = async (imgUrl) => {
    try {
        if (!imgUrl) return;
        const imgSplit = imgUrl.split("/");
        const folderName = imgSplit[imgSplit.length - 2];
        const fileName = imgSplit[imgSplit.length - 1].split(".")[0];
        const publicId = `${folderName}/${fileName}`; 
        
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting img from cloudinary:", error.message);
    }
};

module.exports = { deleteImgCloudinary };