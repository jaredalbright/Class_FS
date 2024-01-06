const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
//const serviceAccount = require('../service_account.json');

// const app = initializeApp({
//   credential: cert(serviceAccount)
// });

const app = initializeApp();

db = getFirestore();

console.log("Initialized DB Successfully");

module.exports = db;