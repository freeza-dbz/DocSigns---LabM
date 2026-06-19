import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
import path from "path";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '..', '.env')
});

await connectDB()
.then(()=>{
    app.on("error", (err) =>{
        console.log("Error occured while starting the server: ", err.message);
        process.exit(1);
    });

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
})
.catch((err) => {
    console.log("mongoDB connection failed: ", err);
    process.exit(1);
})