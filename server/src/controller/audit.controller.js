import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { Document } from "../models/document.model.js";
import { AuditLog } from "../models/audit-log.model.js";
import mongoose from "mongoose";

const getDocumentAuditLogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;

    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }

    // First, verify the user owns the document
    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to view it.");
    }

    const auditLogs = await AuditLog.find({ documentId }).sort({ createdAt: -1 }).populate('user', 'fullName email');

    return res.status(200).json(
        new ApiResponse(200, auditLogs, "Audit logs retrieved successfully")
    );
});

export {
    getDocumentAuditLogs
};