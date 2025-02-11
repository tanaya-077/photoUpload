const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// Signup Route - Show Form
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// Signup Route - Handle Form Submission
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/signup");
    }

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome!!!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    console.log(e.message);
    res.redirect("/signup");
  }
});

// Login Route - Show Form
router.get("/login", (req, res) => {
  res.render("user/login");
});

// Login Route - Handle Form Submission
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/");
  }
);

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/");
  });
});

module.exports = router;
