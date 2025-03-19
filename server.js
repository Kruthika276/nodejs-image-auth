require('dotenv').config();
const express = require('express');
const connectToDB = require('./database/db');
const authRoutes = require('./routes/auth-routes');
const homeRoutes = require('./routes/home-routes');
const adminRoutes = require('./routes/admin-routes');
const uploadImageRoutes = require('./routes/image-routes');

connectToDB();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares to parse the json
// middlewares are also used to authenticate the user, check if user is logged in or not, token, role based authorization(checks if user is admin or not)
// protecting route with middleware 
// why use middleware?
// middleware has the property of executing next function
// first checks if user is logged in or not(authenticated user or not), if authenticated check for user or admin
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/image', uploadImageRoutes);

app.listen(PORT, () => {
    console.log(`Server is now listening to port ${PORT}`);  
}) ;
