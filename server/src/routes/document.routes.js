import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

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
  
} from "../controller/document.controller.js";

const router = Router();

// Protect all document routes
router.use(verifyJWT);

// Static routes first
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getUserDocuments);
router.get("/stats", getDocumentStats);
router.get("/search", searchDocuments);

// Routes with additional segments BEFORE parameterized routes
router.get("/:documentId/preview", getDocumentPreview);
router.patch("/:documentId/status", updateDocumentStatus);


// Parameterized routes LAST (most generic)
router.get("/:documentId", getDocumentById);
router.patch("/:documentId", updateDocument);
router.delete("/:documentId", deleteDocument);

export default router;

