import app from "./app";
import { connectDB } from "./config/db";
import { initializeFirebase } from "./config/firebase";
import dotenv from "dotenv";

dotenv.config();

//  Startup Environment Validation 
const REQUIRED_ENV_VARS = ["JWT_SECRET", "MONGO_URI"];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(
    `[FATAL] Missing required environment variables: ${missingVars.join(", ")}\n` +
    `Please set them in your .env file before starting the server.`
  );
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error("[FATAL] JWT_SECRET must be at least 32 characters long for security.");
  process.exit(1);
}


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Database
  await connectDB();

  // Initialize Firebase Admin SDK for FCM 
  initializeFirebase();

  // Start express app
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

startServer();
