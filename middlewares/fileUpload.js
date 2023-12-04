// fileUploadMiddleware.js

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/');
        // cb(null, './public/');
    },
    filename: (req, file, cb) => {
        const fileType = file.originalname.split('.').pop();
        const fileName = file.originalname;
        cb(null, fileName);
    },
});

const upload = multer({
    storage: storage,
    
    // fileFilter: (req, file, cb) => {
    //     console.log("{{{{___---", file.mimetype);
    //     if (file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'text/csv') {
    //         cb(null, true);
    //     } else {
    //         cb(new Error('Invalid file type. Only Excel (xlsx/xls) and CSV files are allowed.'));
    //     }
    // },
});

// const upload = multer({ dest: 'public/' })

module.exports = upload;
