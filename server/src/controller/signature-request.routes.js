import { Router } from "express";
import { 
    createSignatureRequest, 
    getSignatureRequests, 
    getPublicSignatureRequest, 
    submitSignature,
    sendReminder
} from "../controller/signature-request.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes (for signers)
router.route("/public/:token").get(getPublicSignatureRequest);
router.route("/submit/:token").post(submitSignature);

// Protected routes (for document owners)
router.use(verifyJWT);

router.route("/:documentId")
    .post(createSignatureRequest)
    .get(getSignatureRequests);

router.route("/reminder/:requestId").post(sendReminder);

export default router;