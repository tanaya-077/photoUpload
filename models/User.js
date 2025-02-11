const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        required: true,
        unique: true,
      },
});

userSchema.plugin(passportLocalMongoose); 
module.exports = mongoose.model("User", userSchema);
