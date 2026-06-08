import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
// import { verifyAdmin } from "../middleware/admin.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser
} from "../controller/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJWT, logoutUser);





export default router;