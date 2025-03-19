const cloudinary = require('../config/cloudinary');

// uploadToCloudinary is used to upload the image and then the url and public id is returned
const uploadToCloudinary = async(filePath) => { // receives the file we upload
    try{
        const result = await cloudinary.uploader.upload(filePath);

        return {
            url : result.secure_url,
            publicId : result.public_id,
        };
    }catch(error){
        console.error('Error while uploading to cloudinary', error);
        throw new Error('Error while uploading to cloudinary');
    }
}

module.exports = {
    uploadToCloudinary,
}