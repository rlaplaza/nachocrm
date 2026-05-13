import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const authService = {
  subscribeToAuthChanges: (callback: (user: import("firebase/auth").User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
  getUserProfile: async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },
  signUp: async (email: string, password: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email,
      full_name: fullName,
      created_at: new Date().toISOString()
    });
    return userCredential;
  },
  signOut: () => firebaseSignOut(auth),
};
