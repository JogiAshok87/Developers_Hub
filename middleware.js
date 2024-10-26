const jwt = require('jsonwebtoken')
const devuser = require('./devusermodel');

module.exports = async function(req,res,next){
    try{
        let token = req.header('x-token')//retriving the jwt token from the headers with named variable x-token
        if(!token){
            return res.status(400).send('Token Not found')
        }
        let decoded = jwt.verify(token,'jwtPassword')//verify method takes 2 aruguments, which 1 is token and 2 is SCEREATE KEY
        //And it will it payload which is written in the login route
        req.user = decoded.user;
        // Fetch additional user details
        const user = await devuser.findById(req.user.id).select('fullname');
        if (!user) {
            return res.status(400).send('User not found');
        }
        req.user.fullname = user.fullname; // Attach the fullname to req.user

        next();
    }catch(err){
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send('Token Expired');
          }
          return res.status(401).send('Invalid Token');
    }
}