import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyB5xS4Ww0TwerxNyCnn5wjGuLMlvLxiH78",
  authDomain: "cine-aurora-84d97.firebaseapp.com",
  projectId: "cine-aurora-84d97",
  storageBucket: "cine-aurora-84d97.firebasestorage.app",
  messagingSenderId: "123261466619",
  appId: "1:123261466619:web:7f20edbcb975a8152b7d5e",
  measurementId: "G-CPQ1ZC5FRH",
};

const app = initializeApp(firebaseConfig);

// Analytics é opcional e só funciona em ambientes que suportam
let analytics = null;
(async () => {
  try {
    if (typeof window !== "undefined" && (await analyticsIsSupported())) {
      analytics = getAnalytics(app);
    }
  } catch (_) {
    // ignore analytics errors in unsupported environments
  }
})();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
