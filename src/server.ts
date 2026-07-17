import app from "./app";
import { connectDB } from "./config/db";
import { initializeFirebase } from "./config/firebase";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Database
  await connectDB();

  // Initialize Firebase Admin SDK for FCM
  initializeFirebase();

  // Start express app
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
