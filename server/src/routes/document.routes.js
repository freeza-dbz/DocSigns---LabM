import { Router } from 'express';
import {
    uploadDocument,
    listUserDocuments,
    getDocumentById,
    deleteDocument,
    updateDocument
} from '../controllers/document.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

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