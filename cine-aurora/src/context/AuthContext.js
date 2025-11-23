import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    console.log('Iniciando cadastro para:', email);
    try {
      console.log('Criando usuário no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuário criado no Auth com sucesso. UID:', user.uid);
      
      // Create a user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: email,
        createdAt: new Date(),
        isAdmin: false,
        myList: []
      };
      
      console.log('Tentando salvar no Firestore...');
      await setDoc(doc(db, 'users', user.uid), userDoc);
      console.log('Dados do usuário salvos no Firestore com sucesso!');
      
      return userCredential;
    } catch (error) {
      console.error("Erro durante o cadastro:", error);
      if (error.code) {
        console.error("Código do erro:", error.code);
        console.error("Mensagem do erro:", error.message);
      }
      throw error;
    }
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = { currentUser, signup, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
