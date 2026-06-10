import mongoose, { Schema } from "mongoose";

export const DocumentStatus = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    REJECTED: "REJECTED"
};

const documentSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
            index: true,
        },
        originalFileName: {
            type: String,
            required: [true, "Original filename is required"],
            trim: true,
        },
        cloudinaryPublicId: {
            type: String,
            required: [true, "Cloudinary public ID is required"],
            unique: true,
            index: true,
        },
        cloudinaryUrl: {
            type: String,
            required: [true, "Cloudinary URL is required"],
        },
        fileSize: {
            type: Number,
            required: [true, "File size is required"],
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(DocumentStatus),
            default: DocumentStatus.DRAFT,
            index: true,
        },
        totalPages: {
            type: Number,
            required: [true, "Total pages is required"],
            min: 1,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Compound index for user-specific queries
documentSchema.index({ uploadedBy: 1, isDeleted: 1, createdAt: -1 });
documentSchema.index({ uploadedBy: 1, status: 1, isDeleted: 1 });

export const Document = mongoose.model("Document", documentSchema);