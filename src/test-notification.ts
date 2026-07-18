import { connectDB } from "./config/db";
import { initializeFirebase } from "./config/firebase";
import { NotificationService } from "./modules/notification/service/notification.service";
import { UserRepository } from "./modules/user/repository/user.repository";
import { PostModel } from "./modules/post/model/post.model";
import mongoose from "mongoose";

const testPush = async () => {
  // Connect to DB and Firebase
  await connectDB();
  initializeFirebase();

  const userEmail = process.argv[2];
  if (!userEmail) {
    console.error("Error: Please provide a user email. Example: npm run test-push test@example.com");
    process.exit(1);
  }

  const userRepository = new UserRepository();
  const user = await userRepository.findByEmail(userEmail);

  if (!user) {
    console.error(`Error: User with email ${userEmail} not found in database.`);
    process.exit(1);
  }

  if (!user.fcmToken) {
    console.error(`Error: User ${user.username} does not have a registered FCM token. Make sure you logged in from a physical device.`);
    process.exit(1);
  }

  // Find a sample post to link for test deep linking navigation
  const samplePost = await PostModel.findOne({}).exec();
  const postId = samplePost ? samplePost._id.toString() : new mongoose.Types.ObjectId().toString();

  console.log(`Sending test push notification to user: ${user.username}`);
  console.log(`Deep Link Target Post ID: ${postId}`);

  const notificationService = new NotificationService();
  await notificationService.sendPushNotification(
    user._id!.toString(),
    "Test Notification! 🚀",
    "Hello! Tap this notification to test deep linking to a post details page.",
    { postId, type: "like" }
  );

  console.log("Done. Disconnecting database...");
  await mongoose.disconnect();
};

testPush();
