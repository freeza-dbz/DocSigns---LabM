import multer from "multer"

const storage = multer.diskStorage({ // a method to tell multer that how and where to upload file 
    destination: function (req, file, cb) {
        cb(null, "./cache/temp") // tells multer to store fie in ./cache/temp null as first argument means "no error"
    },
    filename: function (req, file, cb) { // giving name to the saved file  
        cb(null, file.originalname) // giving file the orignal name as given to file by the user
    }
})

export const upload = multer({
    storage,
})