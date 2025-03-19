const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper')
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const uploadImageController = async(req, res) => {
    try{
        // check if file is missing in req object
        if(!req.file){
            return res.status(400).json({
                success : false,
                message : 'File is required. Please upload an image'
            })
        }

        // upload to cloudinary
        const {url, publicId} = await uploadToCloudinary(req.file.path);

        // store image url and public id along with the uploaded user id
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy : req.userInfo.userId
        })
        
        // to store in the database
        await newlyUploadedImage.save();

        // delete the file from local storage
        fs.unlinkSync(req.file.path); // if this is not there then even if we remove from the key pair, it'll still be on the local storage

        res.status(200).json({
            success : true,
            message : 'Image uploaded successfully',
            image : newlyUploadedImage,
        })

    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const fetchImagesController = async(req, res) => {
    try{
        // if there are 10 images and each should show 2 images then there would be 5 pages
        // in 3 rs page 5th and 6th images should be shown and first 4 has to be skipped
        const page = parseInt(req.query.page) || 1; // go to the page or go to 1
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceiil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder;
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);
        if(images) {
            res.status(200).json({
                success : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data : images,
            });
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong'
        });
    }
};

// get the picture id of image to delete
// if a admin deletes the image check if it is uploaded by them, if it is only then delete
// delete from cloudinary first then mongodb
const deleteImageController = async(req, res) => {
    try{
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

        if(!image){
            res.status(404).json({
                success : false,
                message : 'Image not found'
            });
        }

        // check if imahge is uploaded by the person trying to delete
        if(image.uploadedBy.toString !== userId){
            res.status(404).json({
                success : false,
                message : 'You are not authorized to delete this image'
            });
        }

        // delete from cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // delete from mongodb
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);
        res.status(200).json({
            success : true,
            message : 'Deleted successfully'
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong'
        });
    }
}

module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController,
};