import mongoose, { Schema } from "mongoose";

const signatureFieldSchema = new Schema(
    {
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
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
    },
    { timestamps: true }
);

export const SignatureField = mongoose.model("SignatureField", signatureFieldSchema);
