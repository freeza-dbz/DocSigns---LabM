import mongoose, { Schema } from "mongoose";

export const AuditEventType = {
    UPLOADED: "UPLOADED",
    SENT: "SENT",
    VIEWED: "VIEWED",
    SIGNED: "SIGNED",
    COMPLETED: "COMPLETED",
    DECLINED: "DECLINED",
    DOWNLOADED: "DOWNLOADED"
};

const auditLogSchema = new Schema(
    {
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
        },
        eventType: {
            type: String,
            enum: Object.values(AuditEventType),
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // Can be null if the action is done by a public signer
        },
        signerEmail: {
            type: String,
            // Filled if done by a guest signer
        },
        ipAddress: {
            type: String,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        }
    },
    { timestamps: true } // Creates 'createdAt' automatically which acts as timestamp
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
