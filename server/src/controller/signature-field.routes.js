import { Router } from "express";
import { saveSignatureFields, getSignatureFields } from "../controller/signature-field.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All routes here require authentication
router.use(verifyJWT);

router.route("/:documentId")
    .post(saveSignatureFields)
    .get(getSignatureFields);

export default router;