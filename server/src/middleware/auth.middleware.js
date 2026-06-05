import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        let token = req.cookies?.accessToken;

        if (!token) {
            const authHeader = req.header("Authorization")
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.replace("Bearer ", "").trim()
            }
        }

        if (!token) {
            throw new ApiError(401, "Unauthorized request, no token provided")
        }

        if (typeof token !== "string") {
            throw new ApiError(401, "Unauthorized request, invalid form of token provided")
        }

        if (!token.match(/^[A-Za-z0-9-._~+\/]+=*$/)) {
            throw new ApiError(401, "Unauthorized request, invalid form of token provided")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        )

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Unauthorized request, invalid token provided")
    }

})