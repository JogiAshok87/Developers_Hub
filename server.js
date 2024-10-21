// cors : corss origin policies , it used to connect backend routes to easily accessable to frontend

// concurrently is the package where we can use to run both FRONTEND AND BACKEND at a time


const express = require('express')
const mongoose = require('mongoose')
const devuser = require('./devusermodel')
const reviewmodel = require('./reviewmodel')
const jwt = require('jsonwebtoken')
const middleware = require('./middleware')
const dotEnv = require('dotenv')
//const bcrypt = require('bcryptjs'); 
const cors = require("cors")
const app = express()
dotEnv.config()
app.use(express.json()); // to handle JSON payloads
app.use(cors({origin:"*"})) // with passing arg *, we can use routes withOut any restrications in the frontend round

app.use(express.urlencoded({ extended: true })); // to handle form data


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('DB Connected Successfully')
})

app.get("/",(req,res)=>{
    res.send("Hello World!!")
})

app.post('/register',async(req,res)=>{
    try{
        const { fullname, email,mobile,skill,password,Confirmpassword} = req.body;
        const exist = await devuser.findOne({email})
        if(exist){
            return res.status(400).send('User Already Registered')
        }
        if(password != Confirmpassword){
            return res.status(403).send('Invalid Password')
        }
        let newUser = new devuser({
            fullname,email,mobile,skill,password,Confirmpassword
        })
        newUser.save()
        

        const payload = { user: { id: newUser.id } };
        jwt.sign(payload, 'jwtPassword', { expiresIn: '360000000' }, (err, token) => {
        if (err) throw err;
        console.log('Generated Token:', token); // Log token to ensure it's generated
        res.status(200).json({ token }); // Send token in the response
        });
    }
    catch(err){
       console.log(err)
       return res.status(500).send('Server Error')
    }
})

app.post("/login",async (req,res)=>{
    try{
        const {email,password} = req.body;
        const exist = await devuser.findOne({email})//If the email exists in the database, the user's data will be assigned to the exist variable.
        if(!exist){
            return res.status(400).send("User Not Exist")
        }
        if(exist.password != password){
            return res.status(400).send('Password Invalid')

            //This compares the password stored in the database (exist.password) with the password provided by the user in the login form (password).
            //If they don't match, the server sends a 400 status code with a message "Password Invalid". The login process stops here for incorrect passwords.
        }
        let payload={
            user:{
                id: exist.id
            }//If the email and password match, a payload is created.
            //The payload contains an object user with the id of the user. This user id will be encoded in the JWT and can be used later to identify the user in protected routes.
        }
        jwt.sign(payload,"jwtPassword",{expiresIn:360000000},
            (err,token)=>{
              if(err) throw err
              return res.json({token})
            }
        )
        //This uses the jwt.sign() method to create a JWT.
        // The first argument is the payload created earlier.
        // The second argument is the secret key "jwtPassword" used to sign the token. This key should be stored securely (e.g., in environment variables) and not hardcoded in production.
        // The third argument is an options object specifying the expiration time of the token (here, 36000000 seconds or around 11.4 years, which is quite long for a token).
        // The final argument is a callback function, which will either return the token or handle any errors.


    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.get("/allprofiles",middleware,async(req,res)=>{
    try{
        let allprofiles = await devuser.find();
        return res.json(allprofiles);

    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.get("/myprofile",middleware,async(req,res)=>{
    try{
        let user = await devuser.findById(req.user.id)
        return res.json(user)


    }catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }

})

app.post("/addreview",middleware,async(req,res)=>{
    try{
        const {taskworker,rating} = req.body
        const exist  = await devuser.findById(req.user.id);//Here req.user.id is extracting from the middleware
        
        const newReview = new reviewmodel({
            taskprovider : exist.fullname,
            taskworker,rating

        })
        newReview.save();
        return res.status(200).send('Review added successfully')


    }catch(err){
      console.log(err)
      return res.status(500).send('Server Error')
    }
})

app.get('/myreview',middleware,async(req,res)=>{
    try{
        let allreviews = await reviewmodel.find()
        let myreviews = allreviews.filter(review=>review.taskworker.toString()===req.user.id.toString())
        return res.status(200).json(myreviews);
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server errror')
    }
})


app.listen(5000,()=>{
    console.log('Server is started and running successfully at : 5000')
})