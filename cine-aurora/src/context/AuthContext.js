import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { auth } from '../firebase/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper function to translate Firebase error codes
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta.';
    case 'auth/invalid-email':
      return 'O endereço de e-mail é inválido.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma senha mais forte.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada.';
    case 'auth/user-not-found':
      return 'Não há registro de usuário correspondente a este identificador.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login malsucedidas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Erro de rede. Verifique sua conexão com a internet.';
    case 'auth/requires-recent-login':
      return 'Esta operação requer que você faça login novamente.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial já está associada a uma conta de usuário diferente.';
    default:
      return 'Ocorreu um erro desconhecido. Tente novamente.';
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = useCallback(async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: email,
        createdAt: new Date(),
        isAdmin: false,
        myList: []
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return userCredential;
    } catch (error) {
      console.error('Erro durante o cadastro:', error);
      const friendlyMessage = getErrorMessage(error.code);
      throw new Error(friendlyMessage);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erro durante o login:', error);
      const friendlyMessage = getErrorMessage(error.code);
      throw new Error(friendlyMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
      throw new Error('Não foi possível sair. Tente novamente.');
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      signup,
      login,
      logout
    }),
    [currentUser, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
