const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // req has a header
    const authHeader = req.headers['authorization'];
    console.log(authHeader);

    // Bearer <token> --> is given as the output to the console
    const token = authHeader && authHeader.split(" ")[1]; // since we need token we'll get the one after the space
    
    if(!token){
        return res.status(401).json({
            success : false,
            message : 'Access denied. No token provided'
        })
    }

    // decode this token
    try{
        const decodeTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodeTokenInfo);

        req.userInfo = decodeTokenInfo;
        next();
        
    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Access denied"
        })
    }
}

module.exports = authMiddleware;