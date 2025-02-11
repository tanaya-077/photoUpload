const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const { isLoggedIn } = require("../middleware.js");

router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find({}).populate("uploadedBy");
    res.render("photos/index", { photos: photos }); 
  } catch (err) {
    console.error("Error fetching photos:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
});

// Show form to upload a new photo
router.get("/new", isLoggedIn, (req, res) => {
  res.render("new");
});

// Create a new photo
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { title, Image } = req.body;
    if (!title || !Image) {
      req.flash("error", "Title and Image are required");
      return res.redirect("/photos/new");
    }

    const newPhoto = new Photo({
      title,
      Image,
      uploadedBy: req.user._id,
    });

    await newPhoto.save();
    req.flash("success", "Photo uploaded successfully!");
    res.redirect("/photos");
  } catch (error) {
    console.error("Error creating photo:", error);
    req.flash("error", "Could not upload photo");
    res.redirect("/photos/new");
  }
});

// Show a specific photo
router.get("/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).populate("uploadedBy");
    if (!photo) {
      req.flash("error", "Photo not found");
      return res.redirect("/photos");
    }
    res.render("show", { photo }); 
  } catch (err) {
    console.error("Error fetching photo:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/photos");
  }
});

// Show edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      req.flash("error", "Photo not found");
      return res.redirect("/photos");
    }
    if (!photo.uploadedBy.equals(req.user._id)) {
      req.flash("error", "You do not have permission to edit this photo");
      return res.redirect("/photos");
    }
    res.render("edit", { photo }); 
  } catch (err) {
    console.error("Error fetching photo for edit:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/photos");
  }
});

// Update a photo
router.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const { title, Image } = req.body;
    const photo = await Photo.findById(req.params.id);

    if (!photo.uploadedBy.equals(req.user._id)) {
      req.flash("error", "You do not have permission to update this photo");
      return res.redirect("/photos");
    }

    await Photo.findByIdAndUpdate(req.params.id, { title, Image });
    req.flash("success", "Photo updated successfully!");
    res.redirect(`/photos/${req.params.id}`);
  } catch (err) {
    console.error("Error updating photo:", err);
    req.flash("error", "Could not update photo");
    res.redirect("/photos");
  }
});

// Delete a photo
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo.uploadedBy.equals(req.user._id)) {
      req.flash("error", "You do not have permission to delete this photo");
      return res.redirect("/photos");
    }

    await Photo.findByIdAndDelete(req.params.id);
    req.flash("success", "Photo deleted successfully!");
    res.redirect("/photos");
  } catch (err) {
    console.error("Error deleting photo:", err);
    req.flash("error", "Could not delete photo");
    res.redirect("/photos");
  }
});

module.exports = router;
