import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let rtdb: admin.database.Database;

try {
  // Ensure the app isn't initialized multiple times in dev
  if (!admin.apps.length) {
    // Attempt to load from env vars directly
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const databaseURL = process.env.FIREBASE_DATABASE_URL || (projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : undefined);

    if (privateKey) {
      // Try parsing as JSON if it was pasted with quotes
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        try {
          privateKey = JSON.parse(privateKey);
        } catch (e) {
          privateKey = privateKey.slice(1, -1);
        }
      }
      // Replace literal \n with actual newlines if present
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL,
      });
      console.log('Firebase Admin initialized with credentials');
    } else {
      console.warn('Firebase credentials missing in environment. Proceeding with default (or mocked) mode if supported.');
      // Initialize with application default if running on GCP / mocked locally
      admin.initializeApp({ databaseURL });
    }
  }

  db = admin.firestore();
  auth = admin.auth();
  rtdb = admin.database();
} catch (error) {
  console.error('Firebase initialization error', error);
  throw error;
}

export { db, auth, rtdb, admin };
