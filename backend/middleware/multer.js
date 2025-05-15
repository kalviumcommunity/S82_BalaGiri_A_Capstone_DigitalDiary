const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Helper to create directory if not exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/others';

    // Route to correct folders based on field name
    if (file.fieldname === 'photos') {
      folder = 'uploads/photos';
    } else if (file.fieldname === 'audio') {
      folder = 'uploads/audio';
    }

    ensureDirExists(folder); // make sure directory exists
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

module.exports = upload;
