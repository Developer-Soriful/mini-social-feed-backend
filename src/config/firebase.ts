import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let firebaseMessaging: admin.messaging.Messaging | null = null;

export const initializeFirebase = (): void => {
  const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;

  if (!credentialsJson) {
    console.warn("WARNING: FIREBASE_CREDENTIALS_JSON is not defined in .env. Push notifications will be disabled.");
    return;
  }

  try {
    const serviceAccount = JSON.parse(credentialsJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseMessaging = admin.messaging();
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
  }
};

export const getFirebaseMessaging = (): admin.messaging.Messaging | null => {
  return firebaseMessaging;
};
