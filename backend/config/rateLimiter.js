import { rateLimit } from "express-rate-limit";

const generalAPILimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: "Too many requests from this IP, please try again after 15 minutes."
});

const authAPILimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10, // Limit each IP to 10 auth attempts per window
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: "Too many authentication attempts from this IP, please try again after 15 minutes."
});

export { generalAPILimiter, authAPILimiter };