import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { SignatureField } from "../models/signature.model.js";
import { Document } from "../models/document.model.js";
import mongoose from "mongoose";

const saveSignatureFields = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { signatureFields } = req.body;
    const userId = req.user._id;
    
    if (!documentId) throw new ApiError(400, "Document ID is required");
    if (!mongoose.isValidObjectId(documentId)) throw new ApiError(400, "Invalid Document ID format");
    if (!Array.isArray(signatureFields)) throw new ApiError(400, "signatureFields must be an array");

    // Authorize: Check if the user owns the document
    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to edit it.");
    }

    // Delete existing unsigned fields before saving new ones
    await SignatureField.deleteMany({ documentId, isSigned: false }); 
    
    const fieldsToInsert = signatureFields.map(field => ({
        ...field,
        documentId
    }));
    
    const savedFields = await SignatureField.insertMany(fieldsToInsert);

    return res.status(200).json(
        new ApiResponse(200, savedFields, "Signature fields saved successfully")
    );
});

const getSignatureFields = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user._id;

    if (!documentId) throw new ApiError(400, "Document ID is required");
    if (!mongoose.isValidObjectId(documentId)) throw new ApiError(400, "Invalid Document ID format");

    // Authorize: Check if the user owns the document. 
    // Signers will get fields via the public token route.
    const document = await Document.findOne({ _id: documentId, uploadedBy: userId, isDeleted: false });
    if (!document) {
        throw new ApiError(404, "Document not found or you don't have permission to view it.");
    }

    const fields = await SignatureField.find({ documentId });
    return res.status(200).json(new ApiResponse(200, fields, "Signature fields retrieved successfully"));
});

export {
    saveSignatureFields,
    getSignatureFields,
};