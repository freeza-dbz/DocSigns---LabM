import mongoose, { Schema } from "mongoose";

export const SignatureRequestStatus = {
    PENDING: "PENDING",
    VIEWED: "VIEWED",
    SIGNED: "SIGNED",
    DECLINED: "DECLINED",
    EXPIRED: "EXPIRED"
};

const signatureRequestSchema = new Schema(
    {
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
        },
        signerName: {
            type: String,
            required: true,
        },
        signerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(SignatureRequestStatus),
            default: SignatureRequestStatus.PENDING,
        },
        expirationDate: {
            type: Date,
            required: true,
        },
        signedAt: {
            type: Date,
        },
        ipAddress: {
            type: String,
        }
    },
    { timestamps: true }
);

export const SignatureRequest = mongoose.model("SignatureRequest", signatureRequestSchema);
