import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { SignatureField } from "../models/signature.model.js";
import mongoose from "mongoose";

const saveSignatureFields = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { signatureFields } = req.body;
    
    if (!documentId) throw new ApiError(400, "Document ID is required");
    if (!mongoose.isValidObjectId(documentId)) throw new ApiError(400, "Invalid Document ID format");
    if (!Array.isArray(signatureFields)) throw new ApiError(400, "signatureFields must be an array");


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
    if (!documentId) throw new ApiError(400, "Document ID is required");
    if (!mongoose.isValidObjectId(documentId)) throw new ApiError(400, "Invalid Document ID format");

    // TODO: Add validation to check if the user owns the document or is a valid signer for it.

    const fields = await SignatureField.find({ documentId });
    return res.status(200).json(new ApiResponse(200, fields, "Signature fields retrieved successfully"));
});

export {
    saveSignatureFields,
    getSignatureFields,
};