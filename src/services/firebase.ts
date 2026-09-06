import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs, 
  query, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Challenge, Solution, Project, Comment, UserProfile } from "../types";
import { cleanPayload } from "./storage";

// 1. Initialize Firebase Singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use custom firestoreDatabaseId if provided in config
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

let authInitPromise: Promise<FirebaseUser | null> | null = null;

// Ensure an authenticated session exists for Firestore security rules
export async function ensureAuth(): Promise<FirebaseUser | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            unsubscribe();
            resolve(cred.user);
          } catch (err) {
            console.warn("[Firebase] Anonymous sign-in note:", err);
            unsubscribe();
            resolve(null);
          }
        }
      });
    });
  }
  return authInitPromise;
}

// 2. Validate Connection to Firestore (Per SKILL.md mandate)
export async function testConnection(): Promise<boolean> {
  try {
    await ensureAuth();
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Client is operating in offline-cached mode.");
    }
    return false;
  }
}

// 3. Firestore Sync & Data Access Layer
export const FirestoreService = {
  // Check if a collection is populated
  async hasCollectionData(collectionName: string): Promise<boolean> {
    try {
      await ensureAuth();
      const q = query(collection(db, collectionName), limit(1));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (err) {
      console.warn(`[Firestore] Error querying ${collectionName}:`, err);
      return false;
    }
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    try {
      await ensureAuth();
      const snap = await getDocs(collection(db, "challenges"));
      const items: Challenge[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as Challenge);
      });
      return items;
    } catch (err) {
      console.warn("[Firestore] Failed to get challenges from cloud:", err);
      return [];
    }
  },

  async saveChallenge(challenge: Challenge): Promise<void> {
    try {
      await ensureAuth();
      const sanitized = cleanPayload({
        ...challenge,
        cloudUpdatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "challenges", challenge.id), sanitized, { merge: true });
    } catch (err) {
      console.error("[Firestore] Failed to save challenge to cloud:", err);
      throw err;
    }
  },

  // Solutions
  async getSolutions(): Promise<Solution[]> {
    try {
      await ensureAuth();
      const snap = await getDocs(collection(db, "solutions"));
      const items: Solution[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as Solution);
      });
      return items;
    } catch (err) {
      console.warn("[Firestore] Failed to get solutions from cloud:", err);
      return [];
    }
  },

  async saveSolution(solution: Solution): Promise<void> {
    try {
      await ensureAuth();
      const sanitized = cleanPayload({
        ...solution,
        cloudUpdatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "solutions", solution.id), sanitized, { merge: true });
    } catch (err) {
      console.error("[Firestore] Failed to save solution to cloud:", err);
      throw err;
    }
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      await ensureAuth();
      const snap = await getDocs(collection(db, "projects"));
      const items: Project[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as Project);
      });
      return items;
    } catch (err) {
      console.warn("[Firestore] Failed to get projects from cloud:", err);
      return [];
    }
  },

  async saveProject(project: Project): Promise<void> {
    try {
      await ensureAuth();
      const sanitized = cleanPayload({
        ...project,
        cloudUpdatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "projects", project.id), sanitized, { merge: true });
    } catch (err) {
      console.error("[Firestore] Failed to save project to cloud:", err);
      throw err;
    }
  },

  // Users
  async saveUserProfile(user: UserProfile): Promise<void> {
    try {
      await ensureAuth();
      const sanitized = cleanPayload({
        ...user,
        cloudUpdatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "users", user.id), sanitized, { merge: true });
    } catch (err) {
      console.warn("[Firestore] Could not sync user profile:", err);
    }
  },

  // User interaction logging (Per Directive 7 & security rules: /users/{userId}/interactions/{interactionId})
  async logUserInteraction(userId: string, interactionId: string, details: Record<string, any>): Promise<void> {
    try {
      await ensureAuth();
      const sanitized = cleanPayload({
        interactionId,
        timestamp: new Date().toISOString(),
        details,
      });
      await setDoc(doc(db, "users", userId, "interactions", interactionId), sanitized);
    } catch (err) {
      console.warn("[Firestore] Could not log interaction:", err);
    }
  },
};
