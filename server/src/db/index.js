import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME
        });
        console.log(`mongoDB connection established!! DB host: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to mongoDB: ${err.message}`);
        process.exit(1);
    }
}


export default connectDB;
