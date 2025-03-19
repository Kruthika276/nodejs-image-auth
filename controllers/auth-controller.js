const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// routes are needed for controllers
// register controller
const registerUser = async(req, res) => {
    try{
        // first extract user information from our request body
        const {username, email, password, role} = req.body;

        // check if user already exists in our db(username has to be unique)
        const checkExistingUser = await User.findOne({$or : [{username}, {email}]}); // checks for if the same username or email exists in the database
        if(checkExistingUser){
            return res.status(400).json({
                success : false,
                message : "User already exists"
            });
        }
        // hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create a new user and save in your database
        const newlycreatedUser = new User({
            username,
            email,
            password : hashedPassword,
            role : role || 'user'
        });

        await newlycreatedUser.save();
        if(newlycreatedUser){
            res.status(201).json({
                success : true,
                mssage : "User registerd successfully"
            })
        } else {
            res.status(400).json({
                success : false,
                mssage : "Unable to register user"
            })
        }

    }catch(e){
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Some error occured'
        })
    };
}

// login controller
const loginUser = async(req, res) => {
    try{
        const {username, password} = req.body; 

        // ind idf the current user exists or not
        const user = await User.findOne({username});
        if(!user) { 
            return res.status(400).json({
                success : false,
                message : 'Invalid username or password'
            });
        }
         
        // if the password is correct or not
        const isPassword = await bcrypt.compare(password, user.password);
        if(!isPassword){
            return res.status(400).json({
                success : false,
                message : 'Invalid username or password'
            });
        }
        
        // creating token
        // we'll use jsonwebtoken to create token
        // synchronously return jsonwebtoken as a string
        // token are stored in cookies or in system storage
        // won't contain the password 
        // creates an encrypted jsonwebtoken

        const accessToken = jwt.sign({
            userId : user._id,
            username : user.username,
            role : user.role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn : '15m'
        })

        res.status(200).json({
            success : true,
            message : 'Logged in successfully',
            accessToken // this is sent to frontend
        })

    }catch(e){
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Some error occured'
        });
    }
};

const changePassword = async(req, res) => {
    try {
        const userId = req.userInfo.userId;
        
        // extract old and new password
        const {oldPassword, newPassword} = req.body;

        // find the current logged in user
        const user = await User.findById(userId);

        if(!user){
            return req.status(400).json({
                success : false,
                message : 'User not found'
            })
        }

        // check if old password is correct
        // how to check if old password and new password isn't the same
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if(!isPasswordMatch){
            return res.status(400).json({
                success : false,
                message : "Incorrect Password"
            })
        }

        // hash the new password
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // update user password
        user.password = newHashedPassword;
        await user.save();

        res.status(200).json({
            success : true,
            message : 'Password changed successfully'
        });
        
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Some error occured'
        });
    }
}

module.exports = {registerUser, loginUser, changePassword};