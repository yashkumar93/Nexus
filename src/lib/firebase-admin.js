const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function findLocalServiceAccountPath() {
  const files = fs.readdirSync(process.cwd()).filter((file) => (
    file.endsWith('.json') && file.includes('-firebase-adminsdk-')
  ));

  return files.length === 1 ? path.join(process.cwd(), files[0]) : null;
}

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const localServiceAccountPath = findLocalServiceAccountPath();
    let credential;

    if (serviceAccountJson) {
      credential = admin.credential.cert(JSON.parse(serviceAccountJson));
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    } else if (localServiceAccountPath) {
      credential = admin.credential.cert(localServiceAccountPath);
    } else {
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({ credential });
    console.log('[firebase-admin] SDK initialized successfully');
  } catch (err) {
    console.warn(
      '[firebase-admin] SDK initialization skipped:',
      `${err.message}. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON for verified Firebase ID tokens.`
    );
  }
}

module.exports = admin;
