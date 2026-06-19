import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin && corsOrigin !== "*" 
    ? corsOrigin.split(",").map(origin => origin.trim()) 
    : "*";

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";
import documentRouter from "./routes/document.routes.js";
import auditRouter from "./routes/audit.routes.js";
import signatureFieldRouter from "./routes/signature-field.routes.js";
import signatureRequestRouter from "./routes/signature-request.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/audits", auditRouter);
app.use("/api/v1/signature-fields", signatureFieldRouter);
app.use("/api/v1/signature-requests", signatureRequestRouter);

export { app };