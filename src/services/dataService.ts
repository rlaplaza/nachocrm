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
  where,
  WhereFilterOp
} from "firebase/firestore";

export const dataService = {
  getAll: async <T = Record<string, unknown>>(collectionName: string): Promise<(T & { id: string })[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as T }));
  },
  getById: async <T = Record<string, unknown>>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() as T } : null;
  },
  create: async <T extends Record<string, unknown>>(collectionName: string, data: T): Promise<T & { id: string }> => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },
  update: async <T extends Record<string, unknown>>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    await updateDoc(doc(db, collectionName, id), data);
  },
  delete: async (collectionName: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
  },
  getWhere: async <T = Record<string, unknown>>(collectionName: string, field: string, operator: WhereFilterOp, value: unknown): Promise<(T & { id: string })[]> => {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as T }));
  }
};

