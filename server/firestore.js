const { Firestore, FieldValue } = require('@google-cloud/firestore');
const { GoogleAuth } = require('google-auth-library');

let firestoreInstance = null;
let isOperational = false;
let checkDone = false;

async function checkFirestoreAvailable() {
  if (checkDone) return isOperational;
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'vota-v2';

    if (process.env.FIRESTORE_EMULATOR_HOST) {
      firestoreInstance = new Firestore({
        projectId,
        databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)'
      });
      isOperational = true;
      console.log(`[Firestore] Conectado com sucesso ao Firestore Emulator em ${process.env.FIRESTORE_EMULATOR_HOST} (Projeto: ${projectId}).`);
      checkDone = true;
      return true;
    }

    const auth = new GoogleAuth();
    await auth.getApplicationDefault();

    firestoreInstance = new Firestore({
      projectId,
      databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)'
    });
    isOperational = true;
    console.log(`[Firestore] Conectado e autenticado com sucesso no GCP (Projeto: ${projectId}).`);
  } catch (err) {
    isOperational = false;
    console.log('[Firestore] Credenciais GCP não detectadas no ambiente local.');
  }

  checkDone = true;
  return isOperational;
}

module.exports = {
  getFirestore: () => firestoreInstance,
  checkFirestoreAvailable,
  isFirestoreOperational: () => isOperational,
  FieldValue
};
