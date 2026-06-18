import {v2 as cloudinary} from 'cloudinary';            
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filepath) =>{
    try{
        if(!filepath){
            return null;
        }else{
            const response = await cloudinary.uploader.upload(filepath,{
                resource_type: "auto"
            });
            fs.unlinkSync(filepath);// deleting localfile path as no more needed
            // console.log("file uploaded on cloudinary", response);
            return response;
        }
    }
    catch(error){
        console.error("Error uploading file to Cloudinary:", error);
        fs.unlinkSync(filepath);
        return null;
    }
}

export { uploadOnCloudinary }