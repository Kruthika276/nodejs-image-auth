const multer = require('multer');
const path = require('path');

// disk storage engine gives you full control on storing files to disk
// set multer storage
// filename determines what the file should be named inside the folder
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, "uploads/")
    },
    filename : function(req, file, cb){
        cb(null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        )
    }
});

// file filter func
const checkFileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new Error('Not an image!!'))
    }
}

// multer middleware multer(opts)
module.exports = multer({
    storage : storage,
    fileFilter : checkFileFilter,
    limits : {
        fileSize : 5 * 1024 *1024, // 5MB file size
    },
})