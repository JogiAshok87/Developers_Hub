const mongoose = require('mongoose')

const clientRegisterSchema = new mongoose.Schema({

    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"client"
    }
})

module.exports = mongoose.model('Client',clientRegisterSchema);