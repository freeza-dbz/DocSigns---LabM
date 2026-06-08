import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
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