import { Router } from "express";
import { getDocumentAuditLogs } from "../controller/audit.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All routes here require authentication
router.use(verifyJWT);

router.route("/:documentId").get(getDocumentAuditLogs);

export default router;