const jwt = require("jsonwebtoken");
const devuser = require("./models/Developer");
const client = require("./models/Client");

module.exports = async function (req, res, next) {
  try {
    let token = req.header("x-token"); //retriving the jwt token from the headers with named variable x-token
    if (!token) {
      return res.status(400).send("Token Not found");
    }

    let decoded = jwt.verify(token, "jwtPassword"); //verify method takes 2 aruguments, which 1 is token and 2 is SCEREATE KEY
    // console.log("Full decoded token",decoded);

    if (decoded.client){
      req.user={

        id : decoded.client.id,
        role: "client"

      }

      // Fetch client details
      const clientUser = await client.findById(decoded.client.id);
      if (!clientUser){
        return res.status(404).json({message:"Client not found"});

      }
      req.user.fullname = clientUser.fullName





    }else if(decoded.user){
      req.user = {
        id : decoded.user.id,
        role:"developer"
      };

      const developerUser =  await devuser.findById(decoded.user.id);
      if (!developerUser){
        return res.status(404).json({message:"Developer not found"});
      }
      req.user.fullname = developerUser.fullname;
    }else{
      return res.status(401).json({message:"Invalid token structure"})
    }

    // console.log('Processed User Data:',req.user);
    next()




  
    
    








    
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token Expired");
    }
    return res.status(401).send("Invalid Token");
  }
};
