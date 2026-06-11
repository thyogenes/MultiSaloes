const firebaseConfig = {
  apiKey: "AIzaSyACbk4bwMPeFoPrQxq6B_uMHuBJGqgFI_U",
  authDomain: "nailspro-f58b5.firebaseapp.com",
  projectId: "nailspro-f58b5",
  storageBucket: "nailspro-f58b5.firebasestorage.app",
  messagingSenderId: "447240305384",
  appId: "1:447240305384:web:cf92a58aebbd0517e0a75d"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
