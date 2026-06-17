import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { SignatureField } from "../models/signature.model.js";
import { SignatureRequest, SignatureRequestStatus } from "../models/signature-request.model.js";
import { AuditLog, AuditEventType, AuditLogPerformerType } from "../models/audit-log.model.js";
import { Document, DocumentStatus } from "../models/document.model.js";
import { embedSignaturesToPDF } from "../utils/pdfGenerator.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

const createSignatureRequest = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { signerName, signerEmail, expirationDate, message } = req.body;
    const userId = req.user._id;

    if (!documentId || !signerName || !signerEmail || !expirationDate) {
        throw new ApiError(400, "Missing required fields");
    }

    const document = await Document.findOne({ _id: documentId, uploadedBy: userId });
    if (!document) throw new ApiError(404, "Document not found or you don't have permission.");

    const token = crypto.randomBytes(32).toString('hex');

    const request = await SignatureRequest.create({
        documentId,
        signerName,
        signerEmail,
        token,
        expirationDate,
        ipAddress: req.ip
    });

    document.status = DocumentStatus.SENT;
    await document.save();

    await AuditLog.create({
        documentId,
        eventType: AuditEventType.SENT,
        performerType: AuditLogPerformerType.USER, user: userId,
        ipAddress: req.ip,
        details: { signerEmail, message }
    });

    // TODO: Replace console.log with a proper email sending service
    console.log("---------[EMAIL MOCK] Sent to: " + signerEmail + " Link: http://localhost:8080/sign/   -------------" + token);

    return res.status(201).json(new ApiResponse(201, request, "Signature request sent successfully"));
});

const getSignatureRequests = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user._id;

    // Verify user owns the document
    const document = await Document.findOne({ _id: documentId, uploadedBy: userId });
    if (!document) throw new ApiError(404, "Document not found or you don't have permission.");

    const requests = await SignatureRequest.find({ documentId });
    return res.status(200).json(new ApiResponse(200, requests, "Requests retrieved"));
});

const getPublicSignatureRequest = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    const request = await SignatureRequest.findOne({ token }).populate('documentId');
    if (!request) throw new ApiError(404, "Invalid signature token");
    
    if (new Date() > new Date(request.expirationDate)) {
        request.status = SignatureRequestStatus.EXPIRED;
        await request.save();
        throw new ApiError(400, "Signature link has expired");
    }

    if (request.status === SignatureRequestStatus.PENDING) {
        request.status = SignatureRequestStatus.VIEWED;
        await request.save();
        
        await AuditLog.create({
            documentId: request.documentId._id,
            eventType: AuditEventType.VIEWED, performerType: AuditLogPerformerType.SIGNER,
            signerEmail: request.signerEmail, details: { signerName: request.signerName },
            ipAddress: req.ip
        });
        
        const doc = await Document.findById(request.documentId._id);
        if (doc && (doc.status === DocumentStatus.DRAFT || doc.status === DocumentStatus.SENT || doc.status === DocumentStatus.VIEWED)) {
            doc.status = DocumentStatus.VIEWED;
            await doc.save();
        }
    }

    const fields = await SignatureField.find({ documentId: request.documentId._id });

    return res.status(200).json(new ApiResponse(200, { request, document: request.documentId, fields }, "Data retrieved"));
});

const submitSignature = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { fieldId, signatureData, signatureMethod } = req.body; 

    const request = await SignatureRequest.findOne({ token }).populate('documentId');
    if (!request) throw new ApiError(404, "Invalid signature token");

    if (new Date() > new Date(request.expirationDate)) throw new ApiError(400, "Signature link has expired");

    const field = await SignatureField.findById(fieldId);
    if (!field || field.documentId.toString() !== request.documentId._id.toString()) {
        throw new ApiError(404, "Field not found or mismatch");
    }

    field.isSigned = true;
    field.signatureData = signatureData; // Save the base64 signature data
    field.signatureMethod = signatureMethod || 'DRAW';
    field.signatureRequestId = request._id;
    await field.save();

    const allFields = await SignatureField.find({ documentId: request.documentId._id });
    const allSigned = allFields.every(f => f.isSigned);

    if (allSigned) {
        request.status = SignatureRequestStatus.SIGNED;
        request.signedAt = new Date();
        request.ipAddress = req.ip;
        await request.save();

        const doc = await Document.findById(request.documentId._id);
        doc.status = DocumentStatus.SIGNED;

        // Embed signatures into the PDF
        try {
            const pdfBytes = await embedSignaturesToPDF(doc.cloudinaryUrl, allFields);
            
            const tempFilePath = path.join(os.tmpdir(), "signed_" + doc._id + ".pdf");
            fs.writeFileSync(tempFilePath, pdfBytes);
            
            const cloudinaryResponse = await uploadOnCloudinary(tempFilePath, "signed_documents"); // Specify a folder for signed documents
            if (cloudinaryResponse) {
                doc.signedFileUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
                doc.cloudinaryPublicId = cloudinaryResponse.public_id;
                doc.status = DocumentStatus.COMPLETED;
            }
            fs.unlinkSync(tempFilePath); 
        } catch (error) {
            console.error("PDF generation failed:", error);
            // Potentially add an audit log for failure or handle error more gracefully
        }

        await doc.save();

        await AuditLog.create({
            documentId: request.documentId._id,
            eventType: AuditEventType.COMPLETED, performerType: AuditLogPerformerType.SIGNER,
            signerEmail: request.signerEmail, details: { signerName: request.signerName },
            ipAddress: req.ip
        });
    } else {
        await AuditLog.create({
            documentId: request.documentId._id,
            eventType: AuditEventType.SIGNED, performerType: AuditLogPerformerType.SIGNER,
            signerEmail: request.signerEmail,
            ipAddress: req.ip,
            details: { fieldId }
        });
    }

    return res.status(200).json(new ApiResponse(200, field, "Signature submitted successfully"));
});

export {
    createSignatureRequest,
    getSignatureRequests,
    getPublicSignatureRequest,
    submitSignature
};