import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createReviewSchema, updateReviewSchema, queryPaginationSchema } from "../validators/reviewValidator.js";
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:bookId", validateQuery(queryPaginationSchema), getReviews);

router.post("/", verifyJWT, validateBody(createReviewSchema), createReview);

router.put("/:reviewId", verifyJWT, validateBody(updateReviewSchema), updateReview);

router.delete("/:reviewId", verifyJWT, deleteReview);

export default router;