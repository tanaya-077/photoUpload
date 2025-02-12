const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//all photos

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
// Show 
router.get("/new", isLoggedIn, (req, res) => {
  res.render("new");
});

router.post("/", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    const { file } = req;

    if (!title || !file) {
      req.flash("error", "Title and Image are required");
      return res.redirect("/photos/new");
    }

    const newPhoto = new Photo({
      title,
      image: {
        data: file.buffer, 
        contentType: file.mimetype, 
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

// Show 
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

// edit form
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

// Serve image
router.get("/:id/image", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send("Photo not found");
    }

    res.contentType(photo.image.contentType); 
    res.send(photo.image.data);
  } catch (err) {
    console.error("Error serving image:", err);
    res.status(500).send("Could not retrieve image");
  }
});

// Update a photo
router.put("/:id", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      req.flash("error", "Photo not found");
      return res.redirect("/photos");
    }

    if (!photo.uploadedBy.equals(req.user._id)) {
      req.flash("error", "You do not have permission to update this photo");
      return res.redirect("/photos");
    }
    if (!title) {
      req.flash("error", "Title is required");
      return res.redirect(`/photos/${req.params.id}/edit`);
    }
    photo.title = title;
    if (req.file) {
      photo.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await photo.save();
    req.flash("success", "Photo updated successfully!");
    res.redirect(`/photos/${req.params.id}`);
  } catch (err) {
    console.error("Error updating photo:", err);
    req.flash("error", "Could not update photo");
    res.redirect(`/photos/${req.params.id}/edit`);
  }
});
// Delete a photo
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      req.flash("error", "Photo not found");
      return res.redirect("/photos");
    }

    if (!photo.uploadedBy.equals(req.user._id)) {
      req.flash("error", "You do not have permission to delete this photo");
      return res.redirect("/photos");
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
