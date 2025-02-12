const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,  // Store image as binary data (Buffer)
    contentType: String,  // Store MIME type of the image (e.g., image/jpeg)
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
