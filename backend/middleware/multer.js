const multer = require('multer');
const { storage, isCloudinary } = require('../utils/storageService');



const upload = multer({ storage });

module.exports = upload;
