import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { saveSignatureFields, getSignatureFields } from "../controller/signature.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/:documentId", saveSignatureFields);
router.get("/:documentId", getSignatureFields);

export default router;
