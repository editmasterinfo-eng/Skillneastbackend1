import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
  // Ensure the app isn't initialized multiple times in dev
  if (!admin.apps.length) {
    // Attempt to load from env vars directly
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized with credentials');
    } else {
      console.warn('Firebase credentials missing in environment. Proceeding with default (or mocked) mode if supported.');
      // Initialize with application default if running on GCP / mocked locally
      admin.initializeApp();
    }
  }

  db = admin.firestore();
  auth = admin.auth();
} catch (error) {
  console.error('Firebase initialization error', error);
  throw error;
}

export { db, auth, admin };
