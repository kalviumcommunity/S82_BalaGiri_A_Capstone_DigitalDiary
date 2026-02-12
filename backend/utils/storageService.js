const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

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

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: file.fieldname + '-' + Date.now(),
        };
    },
}) : null;

}) : null;

module.exports = {
    storage: hasCloudinaryKeys ? cloudinaryStorageEngine : localStorageEngine,
    isCloudinary: hasCloudinaryKeys
};
