// cors : corss origin policies , it used to connect backend routes to easily accessable to frontend

// concurrently is the package where we can use to run both FRONTEND AND BACKEND at a time




const express = require('express')
const mongoose = require('mongoose') // it is a Mongoose Library, used to interact with MongoDb and defines schemas and models for MongoDb collections
const devuser = require('./devusermodel')
const reviewmodel = require('./reviewmodel')
const jwt = require('jsonwebtoken') //it is a library, used to create and verify JSON Web Tokens (JWT) for authentication and authorization purposes.
const middleware = require('./middleware')
const dotEnv = require('dotenv')  // it is dotenv library , to load environment variables from a .env file into process.env to keep sensitive information like API keys and DB credentials hidden
//const bcrypt = require('bcryptjs'); 
const cors = require("cors")
const app = express()
dotEnv.config()
app.use(express.json()); // it automatically parse incoming JSON data from the body of HTTP requests.
//If you remove app.use(express.json());, the server won't be able to automatically parse the JSON data in the request body, so any attempt to access req.body (which usually holds the parsed JSON data) would return undefined.
app.use(cors({origin:"*"})) // with passing arg *, we can use routes withOut any restrications in the frontend round

app.use(express.urlencoded({ extended: true })); // to handle form data


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('MongoDB Connected Successfully')
})
.catch((error)=>{
    console.log(`${error}`)
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
        // it takes 4 arguments 1)payload  2) SECRET_Key  3) expiration time 4) callback function
        // The first argument is the payload created earlier.
        // The second argument is the secret key "jwtPassword" used to sign the token. This key should be stored securely (e.g., in environment variables) and not hardcoded in production.
        // The third argument is an options object specifying the expiration time of the token (here, 36000000 seconds or around 11.4 years, which is quite long for a token).
        // The final argument is a callback function, which will either return the token or handle any errors.

        // Method	        Purpose	                                     Use Case
        
        // jwt.sign()	    Create a JWT token	                         Generate tokens for users upon login
        // jwt.verify()	   Verify if the token is valid	              Authenticate users in protected routes
        // jwt.decode()	   Decode the token payload without 
        //                     verifying signature	                    Inspect token contents without authentication


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
        const {taskworker,rating,workReview} = req.body
        console.log(req.body)
        const exist  = await devuser.findById(req.user.id);//Here req.user.id is extracting from the middleware

        if (!exist) {
            return res.status(404).send('User not found');
        }
        
        const newReview = new reviewmodel({
            taskprovider : exist.fullname,
            taskworker,rating,workReview

        })
        await newReview.save();

        return res.status(200).send({newReview,message:"Review Added successfully"})


    }catch(err){
      console.log(err)
      return res.status(500).send('Server Error')
    }
})

// app.get('/myreview',middleware,async(req,res)=>{
//     // console.log('user Info from middleware',req.body)
//     // if (!req.user || !req.user.id) {
//     //     return res.status(400).json({ message: 'User information missing' });
//     //   }
//     // try{
//     //    const allreviews = await reviewmodel.findById()
//     //    let myreview = allreviews.filter(review=>review.taskworker.toString()=== req.user.id.toString())

//     //    return res.status(200).json(myreview);
//     // }
//     // catch(err){
//     //     console.log(err)
//     //     return res.status(500).send('Server errror')
//     // }
//     try {
//         console.log('User object from req.user:', req.user);


//         const reviews = await reviewmodel.find({ taskworker: req.user.fullname }); 
//           console.log(reviews)
          
//           // Simplify query temporarily
//         // console.log('All Reviews:', reviews);
//         // const myReview = reviews.filter(
//         //     (review) => review.taskworker.toLowerCase() === req.user.id.toLowerCase()
//         //   );
//         //   console.log('Filtered Reviews:', myReview);
//         //   if (myReview.length === 0) {
//         //     return res.status(404).json({ message: 'No reviews found for the user.' });
//         //   }
      
//           res.status(200).json(reviews);
//       } catch (error) {
//         console.error('Error fetching reviews:', error); // Log full error
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//       }
// })
app.get('/myreview', middleware, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'User information missing' });
        }
        console.log('User ID from req.user:', req.user);

        const reviews = await reviewmodel.find({ taskworker: req.user.fullname });
        console.log('Fetched Reviews:', reviews);

        if (!reviews.length) {
            return res.status(404).json({ message: 'No reviews found for the user.' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



app.listen(5000,()=>{
    console.log('Server is started and running successfully at : 5000')
})



//status codes 

//5xx series : server Errors (These codes indicate that the server encountered an error or is unable to process the request. e.g., 500 Internal Server Error)
//4xx series : client Errors (These codes indicate that there was an issue with the client’s request.   (e.g., 400 Bad Request, 404 Not Found).)
//3xx series : Redirection  (These codes tell the client that further action is needed to complete the request.)
//2xx series : Success  (These codes indicate that the client's request was successfully processed by the server.)
//1xx series : Informational Responses (These codes indicate that the request was received and understood, but the client should wait for further instructions.)