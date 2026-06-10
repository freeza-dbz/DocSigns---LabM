import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null
    } else {
      const response = await cloudinary.uploader.upload(localFilePath, { // Uploading file on clodinary
        resource_type: "auto"
      })
      // console.log("File has been uploaded successfully", response.url);//only for testing
      fs.unlinkSync(localFilePath)
      // console.log(response)
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally stored file as the upload operation has failed
    return null;
  }
}

export { uploadOnCloudinary }