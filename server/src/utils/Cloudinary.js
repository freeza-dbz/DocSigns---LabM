import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folderName) => {
    try {
        if (!localFilePath) {
            return null
        }
        
        let uploadOptions = { resource_type: "auto" };
        let finalPath = localFilePath;
        
        if (localFilePath.endsWith('.pdf')) {
            uploadOptions = { resource_type: "raw" };
            finalPath = localFilePath.replace('.pdf', '.txt');
            fs.renameSync(localFilePath, finalPath);
        }
        
        if (folderName) {
            uploadOptions.folder = folderName;
        }

        const response = await cloudinary.uploader.upload(finalPath, uploadOptions);
        fs.unlinkSync(finalPath);
        return response;
    }
    catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        const finalPath = localFilePath.replace('.pdf', '.txt');
        if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
        }
        return null;
    }
}

export { uploadOnCloudinary }