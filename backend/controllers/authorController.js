import Author from "../models/Author.js";

export const listAuthors = async (_req, res) => {
  const authors = await Author.find().sort("name");
  res.json(authors);
};
export const getAuthor = async (req, res) => {
  const a = await Author.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Author not found" });
  res.json(a);
};
export const createAuthor = async (req, res) => {
  const a = await Author.create(req.body);
  res.status(201).json(a);
};
export const updateAuthor = async (req, res) => {
  const a = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!a) return res.status(404).json({ message: "Author not found" });
  res.json(a);
};
export const deleteAuthor = async (req, res) => {
  const a = await Author.findByIdAndDelete(req.params.id);
  if (!a) return res.status(404).json({ message: "Author not found" });
  res.json({ message: "Author deleted" });
};