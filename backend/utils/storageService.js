const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const hasCloudinaryKeys = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryKeys) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const localStorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/others';
        if (file.fieldname === 'photos') folder = 'uploads/photos';
        else if (file.fieldname === 'audio') folder = 'uploads/audio';

        ensureDirExists(folder);
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        // E2EE Check: If filename matches generated ID pattern, use it directly
        // Pattern: Alphanumeric string + .enc or .audio.enc
        if (/^[a-zA-Z0-9]+\.(enc|audio\.enc)$/.test(file.originalname)) {
            cb(null, file.originalname);
        } else {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    }
});

const cloudinaryStorageEngine = hasCloudinaryKeys ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'digital_diary/others';
        let resource_type = 'auto';

        if (file.fieldname === 'photos') {
            folder = 'digital_diary/photos';
            resource_type = 'image';
        } else if (file.fieldname === 'audio') {
            folder = 'digital_diary/audio';
            resource_type = 'video';
        }

        // E2EE Check for Cloudinary
        let public_id = file.fieldname + '-' + Date.now();
        if (/^[a-zA-Z0-9]+\.(enc|audio\.enc)$/.test(file.originalname)) {
            // Remove extension for public_id if desired, or keep it. 
            // Cloudinary usually adds extension based on format, but for raw blobs it might be different.
            // Since we are uploading encrypted blobs, we might want to keep the name as is for the public_id to track it?
            // However, Cloudinary public_ids don't typically include extension. 
            // Let's use the basename of the encrypted file as the public_id to be safe and consistent.
            public_id = path.parse(file.originalname).name;
            // Note: If the file is 'abc.enc', name is 'abc'. If 'abc.audio.enc', name is 'abc.audio'.
            // This preserves the full unique ID part.
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: public_id,
        };
    },
}) : null;

module.exports = {
    storage: hasCloudinaryKeys ? cloudinaryStorageEngine : localStorageEngine,
    isCloudinary: hasCloudinaryKeys
};
