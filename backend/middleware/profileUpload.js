const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/profiles/',
    filename: function(req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('profileImage');

module.exports = upload;