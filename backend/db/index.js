const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp();

db = getFirestore();

console.log("Initialized DB Successfully");

module.exports = db;