import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import {
    uploadDocument,
    listUserDocuments,
    getDocumentById,
    deleteDocument,
    updateDocument
} from '../controller/document.controller.js';

const router = Router();

// Apply JWT verification to all routes in this file  
router.use(verifyJWT);

router.route('/')
    .post(upload.single('document'), uploadDocument)
    .get(listUserDocuments);

router.route('/:documentId')
    .get(getDocumentById)
    .patch(updateDocument)
    .delete(deleteDocument);

export default router;