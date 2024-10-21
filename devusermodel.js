const mongoose = require('mongoose')

//The Properties taken from the user should be in the schema
const devuser = new mongoose.Schema({
    fullname:{
        type: String,
        required : true,
    },
    email:{
        type: String,
        required: true,
    },
    mobile:{
        type: String,
        required: true,
    },
    skill:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    Confirmpassword:{
        type: String,
        required: true,
    }

})

module.exports = mongoose.model("devuser",devuser)
//The  1st parameter is model name
// The 2nd parameter is schema