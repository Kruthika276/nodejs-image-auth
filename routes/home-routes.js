const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const router = express.Router();

// how to protect the route???
// we can pass multiple handlers
// router.get('/welcome', handler1, handler2 (req, res)..... -->if handler1 is successful, handler2 is executed, and so on if one fails it wont go to other 
// similarly here it'll go to the home page one only if authenticationn is successful
// whenever the down route gets called, it calls authMiddleware which checks the token from frontend
router.get('/welcome', authMiddleware, (req, res) => {
    const {username, userId, role} = req.userInfo; // to pass the credentials back to frontend to render on the frontend
    res.json({
        message : 'Welcome to home page',
        user: {
            _id : userId,
            username,
            role
        }
    })
});

module.exports = router;