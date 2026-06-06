import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        originalFilename: {
            type: String,
            required: true,
        },
        storageKey: {
            type: String,
            required: true,
            unique: true,
        },
        fileSize: {
            type: Number, 
            required: true,
        },
        totalPages: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'processing', 'sent', 'completed', 'voided'],
            default: 'draft',
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


export const Document = mongoose.model("Document", documentSchema);