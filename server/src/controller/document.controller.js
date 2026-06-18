import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { Document } from "../models/document.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import { AuditLog, AuditEventType, AuditLogPerformerType } from "../models/audit-log.model.js";


const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const userId = req.user._id;
    const title = req.body.documentName || req.file.originalname;

    try {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

        const document = await Document.create({
            title,
            originalFileName: req.file.originalname,
            cloudinaryPublicId: cloudinaryResponse.public_id,
            cloudinaryUrl: cloudinaryResponse.secure_url || cloudinaryResponse.url,
            fileSize: req.file.size,
            uploadedBy: userId,
            totalPages: 1, 
        });

        await AuditLog.create({
            documentId: document._id,
            eventType: AuditEventType.UPLOADED,
            performerType: AuditLogPerformerType.USER,
            user: userId,
            ipAddress: req.ip,
            details: {
                fileName: document.originalFileName,
                fileSize: document.fileSize,
            }
        });

        return res.status(201).json(
            new ApiResponse(201, document, "Document uploaded successfully")
        );
    } catch (error) {
        console.error("Error during document upload:", error);
        throw error;
    }
});

const getUserDocuments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const documents = await Document.find({ uploadedBy: userId, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
        
    const total = await Document.countDocuments({ uploadedBy: userId, isDeleted: false });
    const result = { documents, total, page: parseInt(page), limit: parseInt(limit) };

    return res.status(200).json(
        new ApiResponse(200, result, "Documents retrieved successfully")
    );
}); 

const getDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;
    
    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }

    const document = await Document.findOne({ _id: documentId, uploadedBy:   userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found");  
    }

    return res.status(200).json(
        new ApiResponse(200, document, "Document retrieved successfully")
    );
});

const getDocumentPreview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;
    
    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }

    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to view it.");
    }

    // Log the download/preview action
    await AuditLog.create({
        documentId: document._id,
        eventType: AuditEventType.DOWNLOADED,
        performerType: AuditLogPerformerType.USER,
        user: userId,
        ipAddress: req.ip,
        details: {
            fileName: document.originalFileName,
            version: 'original'
        }
    });

    return res.redirect(document.cloudinaryUrl);
});

const updateDocument = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;
    const { title } = req.body;

    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }
    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required for an update.");
    }

    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });

    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to edit it.");
    }

    const oldTitle = document.title;
    document.title = title;
    await document.save({ validateBeforeSave: false });

    await AuditLog.create({
        documentId: document._id,
        eventType: AuditEventType.UPDATED,
        performerType: AuditLogPerformerType.USER,
        user: userId,
        ipAddress: req.ip,
        details: {
            field: 'title',
            oldValue: oldTitle,
            newValue: title,
        }
    });

    return res.status(200).json(
        new ApiResponse(200, document, "Document updated successfully")
    );
});

const deleteDocument = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;
    
    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }

    const document = await Document.findOneAndUpdate(
        { _id: documentId, uploadedBy: userId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
    );

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Document deleted successfully")
    );
});

const getDocumentStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const total = await Document.countDocuments({ uploadedBy: userId, isDeleted: false });
    
    const statsPipeline = await Document.aggregate([
        { $match: { uploadedBy: userId, isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = { total };
    statsPipeline.forEach(stat => {
        stats[stat._id] = stat.count;
    });

    return res.status(200).json(
        new ApiResponse(200, stats, "Statistics retrieved successfully")
    );
});

const updateDocumentStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;
    const { status } = req.body;
    
    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }
    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const document = await Document.findOneAndUpdate(
        { _id: documentId, uploadedBy: userId, isDeleted: false },
        { $set: { status } },
        { new: true, runValidators: true } // runValidators ensures the status matches your enum
    );

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    return res.status(200).json(
        new ApiResponse(200, document, "Document status updated successfully")
    );
});

const searchDocuments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
        throw new ApiError(400, "Search query is required");
    }

    const skip = (page - 1) * limit;

    const documents = await Document.find({
        uploadedBy: userId,
        isDeleted: false,
        title: { $regex: q, $options: "i" }
    }).skip(skip).limit(parseInt(limit));

    const total = await Document.countDocuments({
        uploadedBy: userId,
        isDeleted: false,
        title: { $regex: q, $options: "i" }
    });

    const result = { documents, total, page: parseInt(page), limit: parseInt(limit) };

    return res.status(200).json(
        new ApiResponse(200, result, "Search results retrieved successfully")
    );
});

const downloadSignedDocument = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { documentId } = req.params;

    if (!documentId) {
        throw new ApiError(400, "Document ID is required");
    }
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid Document ID format");
    }

    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to view it.");
    }

    if (!document.signedFileUrl) {
        throw new ApiError(404, "Signed document is not available for download.");
    }

    await AuditLog.create({
        documentId: document._id,
        eventType: AuditEventType.DOWNLOADED,
        performerType: AuditLogPerformerType.USER,
        user: userId,
        ipAddress: req.ip,
        details: {
            fileName: `signed_${document.originalFileName}`,
            version: 'completed'
        }
    });

    return res.redirect(document.signedFileUrl);
});

export {
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
};
