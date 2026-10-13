import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample Route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello, TypeScript Express Backend!" });
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
