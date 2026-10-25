/**
 * Firebase Configuration for SkilltoSettle
 * Loads configuration dynamically from Vite environment variables (.env)
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skill-to-settle.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skill-to-settle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skill-to-settle.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export default firebaseConfig;
