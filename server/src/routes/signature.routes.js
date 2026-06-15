import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    saveSignatureFields, 
    getSignatureFields, 
    createSignatureRequest, 
    getSignatureRequests, 
    getPublicSignatureRequest, 
    submitSignature 
} from "../controller/signature.controller.js";

const router = Router();

// Public routes (using token)
router.get("/public/:token", getPublicSignatureRequest);
router.post("/public/:token/submit", submitSignature);

// Protected routes
router.use(verifyJWT);

// Signature Fields
router.post("/:documentId/fields", saveSignatureFields);
router.get("/:documentId/fields", getSignatureFields);

// Signature Requests
router.post("/:documentId/requests", createSignatureRequest);
router.get("/:documentId/requests", getSignatureRequests);

export default router;
