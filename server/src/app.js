import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from "./controller/user.routes.js";
import documentRouter from "./controller/document.routes.js";
import auditRouter from "./controller/audit.routes.js";
import signatureFieldRouter from "./controller/signature-field.routes.js";
import signatureRequestRouter from "./controller/signature-request.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/audits", auditRouter);
app.use("/api/v1/signature-fields", signatureFieldRouter);
app.use("/api/v1/signature-requests", signatureRequestRouter);

export { app };