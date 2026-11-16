import express from "express";
import SQLRouter from "./SQL-router.js";

const app = express();
//backend request
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  next();
});

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1", SQLRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

export default app;
