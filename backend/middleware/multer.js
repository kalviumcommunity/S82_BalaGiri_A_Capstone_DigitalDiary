const multer = require('multer');
const { storage, isCloudinary } = require('../utils/storageService');

console.log(`[Storage] Initialized using: ${isCloudinary ? 'Cloudinary' : 'Local Disk Storage'}`);

const upload = multer({ storage });

module.exports = upload;
