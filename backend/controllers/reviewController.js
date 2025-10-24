import Review from "../models/reviewModel.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import { winstonLogger } from "../config/logger.js";

const updateBookRating = async (bookId) => {
  try {
    const reviews = await Review.find({ bookId });

    const ratingCount = reviews.length;

    if (ratingCount === 0) {
      await Book.findByIdAndUpdate(bookId, {
        ratingAvg: 0,
        ratingCount: 0,
      });
      return;
    }

    const ratingSum = reviews.reduce((acc, item) => acc + item.rating, 0);
    const ratingAvg = (ratingSum / ratingCount).toFixed(1);

    await Book.findByIdAndUpdate(bookId, {
      ratingAvg,
      ratingCount,
    });
  } catch (error) {
    winstonLogger.error(`Failed to update book rating for ${bookId}:`, error);
    console.error(`Failed to update book rating for ${bookId}:`, error);
  }
};

export const getReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { bookId: bookId };

    const [reviews, totalItems] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit,
      },
      data: reviews,
    });
    
  } catch (error) {
    winstonLogger.error("Server error on getReviews controller", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { bookId, rating, review } = req.body;
    const userId = req.user.id;

    const hasPurchased = await Order.findOne({
      userId: userId,
      'items.bookId': bookId,
      status: 'delivered',
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: 'You can only review books you have purchased.',
      });
    }

    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this book. You can edit your review.',
      });
    }

    const newReview = new Review({
      userId,
      bookId,
      rating,
      review,
    });
    await newReview.save();

    await updateBookRating(bookId);

    res.status(201).json(newReview);
  } catch (error) {
    winstonLogger.error("Server error on createReview controller", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const reviewDoc = await Review.findById(reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (reviewDoc.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Not authorized to update this review',
      });
    }

    reviewDoc.rating = rating;
    reviewDoc.review = review;
    await reviewDoc.save();

    await updateBookRating(reviewDoc.bookId);

    res.status(200).json(reviewDoc);
  } catch (error) {
    winstonLogger.error("Server error on updateReview controller", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const reviewDoc = await Review.findById(reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (reviewDoc.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Not authorized to delete this review',
      });
    }

    const bookId = reviewDoc.bookId;

    await reviewDoc.deleteOne();

    await updateBookRating(bookId);
  
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    winstonLogger.error("Server error on deleteReview controller", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};