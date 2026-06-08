import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/document.model.js";
import { PDFDocument as PDFLibDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

/**
 * @description Controller to handle PDF document uploads
 * @route POST /api/v1/documents
 * @access Private
 */
const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded or file type is not a PDF.");
    }

    const filePath = req.file.path;

    try {
        // Extract title from request body or use filename
        const title = req.body.title || path.parse(req.file.originalname).name;

        // Get page count from the PDF
        const pdfBytes = await fs.readFile(filePath);
        const pdfDoc = await PDFLibDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        const document = await Document.create({
            owner: req.user._id,
            title,
            originalFilename: req.file.originalname,
            storageKey: req.file.filename,
            fileSize: req.file.size,
            totalPages,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, document, "Document uploaded successfully"));

    } catch (error) {
        // Cleanup: If any error occurs after file upload, delete the file
        await fs.unlink(filePath);
        throw new ApiError(500, error.message || "Failed to process the uploaded document");
    }
});

/**
 * @description Controller to list all documents for the logged-in user
 * @route GET /api/v1/documents
 * @access Private
 */
const listUserDocuments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const documents = await Document.find({ owner: req.user._id, isDeleted: false })
        .sort(sortOptions)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

    const totalDocuments = await Document.countDocuments({ owner: req.user._id, isDeleted: false });

    const response = {
        documents,
        totalPages: Math.ceil(totalDocuments / options.limit),
        currentPage: options.page,
        totalDocuments,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Documents retrieved successfully"));
});

/**
 * @description Controller to get a single document by its ID
 * @route GET /api/v1/documents/:documentId
 * @access Private
 */
const getDocumentById = asyncHandler(async (req, res) => {
    const { documentId } = req.params;

    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid document ID");
    }

    // Security: Ensure the user owns the document and it's not soft-deleted
    const document = await Document.findOne({
        _id: documentId,
        owner: req.user._id,
        isDeleted: false
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, document, "Document retrieved successfully"));
});

/**
 * @description Controller to update a document's details (e.g., title)
 * @route PATCH /api/v1/documents/:documentId
 * @access Private
 */
const updateDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new ApiError(400, "Title is required and must be a non-empty string.");
    }

    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid document ID");
    }

    const updatedDocument = await Document.findOneAndUpdate(
        { _id: documentId, owner: req.user._id, isDeleted: false }, // Security check
        { $set: { title: title.trim() } },
        { new: true }
    );

    if (!updatedDocument) {
        throw new ApiError(404, "Document not found or you do not have permission to update it.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDocument, "Document updated successfully"));
});

/**
 * @description Controller to soft-delete a document
 * @route DELETE /api/v1/documents/:documentId
 * @access Private
 */
const deleteDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;

    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid document ID");
    }

    const document = await Document.findOneAndUpdate(
        { _id: documentId, owner: req.user._id, isDeleted: false }, // Security check
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
    );

    if (!document) {
        throw new ApiError(404, "Document not found or already deleted.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Document deleted successfully"));
});

export {
    uploadDocument,
    listUserDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
};