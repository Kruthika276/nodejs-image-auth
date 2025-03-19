const mongoose = require('mongoose');
const connectToDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB is successfully connected');
        
    }catch(e){
        console.log("MongoDB connection failed");
        process.exit(1);
    }
};

module.exports = connectToDB;
