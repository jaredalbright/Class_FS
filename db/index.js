const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../service_account.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

db = getFirestore();

console.log("Initialized DB Successfully");

module.exports = db;