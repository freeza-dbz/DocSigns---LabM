import { Router } from "express";
import {
    uploadDocument,
    getUserDocuments,
    getDocumentById,
    getDocumentPreview,
    updateDocument,
    deleteDocument,
    getDocumentStats,
    updateDocumentStatus,
    searchDocuments,
    downloadSignedDocument
} from "../controller/document.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All routes here require authentication
router.use(verifyJWT);

router.route("/")
    .post(upload.single("document"), uploadDocument)
    .get(getUserDocuments);

router.route("/stats").get(getDocumentStats);
router.route("/search").get(searchDocuments);

router.route("/:documentId")
    .get(getDocumentById)
    .patch(updateDocument)
    .delete(deleteDocument);

router.route("/:documentId/preview").get(getDocumentPreview);
router.route("/:documentId/status").patch(updateDocumentStatus);
router.route("/:documentId/download/signed").get(downloadSignedDocument);

export default router;