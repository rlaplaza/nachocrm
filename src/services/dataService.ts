import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";

export const dataService = {
  getAll: async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  getById: async (collectionName: string, id: string) => {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  create: async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  },
  update: async (collectionName: string, id: string, data: any) => {
    await updateDoc(doc(db, collectionName, id), data);
  },
  delete: async (collectionName: string, id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  }
};
