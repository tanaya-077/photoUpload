const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });

// Get all photos
router.get('/', async (req, res) => {
    try {
        const photos = await Photo.find({}).populate("uploadedBy");
        res.render("index", { photos });
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

// Handle photo upload
router.post("/", isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || !req.file) {
            req.flash("error", "Title and Image are required");
            return res.redirect("/photos/new");
        }

        const newPhoto = new Photo({
            title,
            image: {
                url: req.file.path,
                filename: req.file.filename
            },
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

// Update a photo
router.put("/:id", isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        const photo = await Photo.findById(req.params.id);

        if (!photo.uploadedBy.equals(req.user._id)) {
            req.flash("error", "You do not have permission to update this photo");
            return res.redirect("/photos");
        }

        const updates = { title };
        
        if (req.file) {
            // Delete old image from Cloudinary
            if (photo.image.filename) {
                await cloudinary.uploader.destroy(photo.image.filename);
            }
            // Add new image
            updates.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await Photo.findByIdAndUpdate(req.params.id, updates);
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

        if (photo.image.filename) {
            await cloudinary.uploader.destroy(photo.image.filename);
        }
        await Photo.deleteOne({ _id: photo._id });
        req.flash("success", "Photo deleted successfully!");
        res.redirect("/photos");
    } catch (err) {
        console.error("Error deleting photo:", err);
        req.flash("error", "Could not delete photo");
        res.redirect("/photos");
    }
});

module.exports = router;