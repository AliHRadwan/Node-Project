import Book from "../models/Book.js";
import Order from "../models/Order.js";
import { winstonLogger } from "../config/logger.js";


export const getBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const hasPurchased = await Order.findOne({
      userId: userId,
      "items.bookId": bookId,
      status: "paid",
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can only download the books you have purchased.",
      });
    }

    const bookDoc = await Book.findById(bookId);
    if (!bookDoc) {
      return res.status(404).json({ message: "Book not found" });
    }

    const bookPath = bookDoc.pdfUrl;

    res.download(bookPath, "bookstore-book.pdf", (err) => {
      if (err) {
        winstonLogger.error("Failed to download a book", err);
        res.status(500).send("Error downloading file.");
      }
    });
    
  } catch (error) {
    winstonLogger.error("Server error on getting a book", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};