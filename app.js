const express = require('express');
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash"); 
const User = require("./models/user.js");
const photoRoutes = require("./routes/photos");
const userRoutes = require("./routes/users"); 
const Photo = require("./models/Photo.js");
const multer = require("multer");
// Connect to MongoDB
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/photo');
  console.log("Connected to DB");
}

main().catch(err => console.log(err));

const sessionOptions = {
  secret: "mySecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); 
  res.locals.error = req.flash("error"); 
  res.locals.currentUser = req.user;
  next();
});


app.use("/uploads", express.static("uploads"));
app.use("/photos", photoRoutes);
app.use("/", userRoutes); 
app.get('/', (req, res) => {
  res.redirect('/photos');
});
const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
