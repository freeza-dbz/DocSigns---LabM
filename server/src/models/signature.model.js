import mongoose, { Schema } from "mongoose";

const signatureFieldSchema = new Schema(
    {
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
        },
        signatureRequestId: {
            type: Schema.Types.ObjectId,
            ref: "SignatureRequest",
            default: null,
        },
        page: {
            type: Number,
            required: true
        },
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            default: 150
        },
        height: {
            type: Number,
            default: 60
        },
        isSigned: {
            type: Boolean, default: false
        },
        signatureData: {
            type: String, // Store image URL or base64
        },
        signatureMethod: {
            type: String,
            enum: ['DRAW', 'TYPE', 'UPLOAD'],
        }
    },
    { timestamps: true }
);

export const SignatureField = mongoose.model("SignatureField", signatureFieldSchema);
