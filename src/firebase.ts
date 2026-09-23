import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, SpinResult, ChatMessage, CryptoCurrency } from './types';

export const ADMIN_EMAILS = ['beamlakub9@gmail.com'];

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === email.toLowerCase());
}

export function isUserAdmin(user: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.isAdmin === true || isAdminEmail(user.email);
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom named database and force long-polling for reliable connectivity
const dbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  dbId
);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Validate connection to Firestore on boot with timeout safeguard
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 4000)
    );
    await Promise.race([testPromise, timeoutPromise]);
    console.info('[Firebase] Firestore connected successfully to', firebaseConfig.firestoreDatabaseId || '(default)');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client appears offline. Operating with local cache.');
    } else {
      console.info('[Firebase] Firestore client initialized.');
    }
    return false;
  }
}
testConnection();

/**
 * OperationType for structured Firestore error handling per Skill standard
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Ensure anonymous authentication for guests so Firestore security rules succeed
 */
export async function ensureFirebaseAuth(): Promise<FirebaseUser | null> {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.warn('[Firebase] Anonymous sign-in warning:', error);
    return null;
  }
}

/**
 * Sync user profile to Firestore (including Name & Phone Number)
 */
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  const path = 'users';
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const uid = currentAuthUser?.uid || user.id;
    if (!uid) return;

    const email = user.email || currentAuthUser?.email || '';
    const isAdmin = isUserAdmin(user) || isAdminEmail(email);
    const role = isAdmin ? 'admin' : (user.role || 'user');
    const name = user.name || user.username;
    const cleanPhone = (user.phoneNumber || user.telebirrNumber || '').trim().replace(/\s+/g, '');

    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        id: uid,
        localId: user.id,
        email,
        name,
        username: user.username,
        phoneNumber: cleanPhone,
        telebirrNumber: cleanPhone,
        avatar: user.avatar,
        address: user.address,
        authProvider: user.authProvider || (currentAuthUser?.isAnonymous ? 'anonymous' : 'phone'),
        balances: user.balances,
        vipTier: user.vipTier,
        vipPoints: user.vipPoints,
        role,
        isAdmin,
        clientSeed: user.clientSeed,
        updatedAt: Date.now()
      },
      { merge: true }
    );

    console.info(`[Firebase] User profile successfully written to Firestore: /users/${uid}`, {
      name,
      phoneNumber: cleanPhone,
      database: firebaseConfig.firestoreDatabaseId
    });

    // If user is admin, also register in /admins collection in Firestore
    if (isAdmin) {
      try {
        const adminRef = doc(db, 'admins', uid);
        await setDoc(
          adminRef,
          {
            userId: uid,
            email: email || 'beamlakub9@gmail.com',
            role: 'admin',
            grantedAt: Date.now(),
            grantedBy: 'system_root'
          },
          { merge: true }
        );
        console.info('[Firebase] Admin user synchronized to Firestore (/admins/' + uid + ')');
      } catch (adminErr) {
        console.warn('[Firebase] Could not sync to /admins collection:', adminErr);
      }
    }
  } catch (err: any) {
    console.warn('[Firebase] Warning syncing user profile to Firestore:', err?.message || err);
  }
}

/**
 * Save user phone login record directly to Firestore (/phone_logins)
 */
export async function savePhoneLoginRecordToFirestore(
  name: string,
  phoneNumber: string,
  userId?: string,
  extra?: Record<string, any>
): Promise<void> {
  const path = 'phone_logins';
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const finalUid = currentAuthUser?.uid || userId || 'usr_phone';
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    const cleanName = name.trim();

    const loginsCol = collection(db, 'phone_logins');
    const docRef = await addDoc(loginsCol, {
      userId: finalUid,
      name: cleanName,
      username: cleanName,
      phoneNumber: cleanPhone,
      telebirrNumber: cleanPhone,
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
      ...(extra || {})
    });
    console.info(`[Firebase] Phone login record saved to Firestore: /phone_logins/${docRef.id}`, {
      name: cleanName,
      phoneNumber: cleanPhone
    });
  } catch (err) {
    console.warn('[Firebase] Notice saving phone login record to Firestore:', err);
  }
}

/**
 * Query Firestore to check if an account with this phone number already exists
 */
export async function findUserByPhoneInFirestore(phoneNumber: string): Promise<Partial<UserProfile> | null> {
  const path = 'users';
  try {
    const clean = phoneNumber.trim().replace(/\s+/g, '');
    if (!clean) return null;
    await ensureFirebaseAuth();

    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('phoneNumber', '==', clean), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      return {
        id: snap.docs[0].id,
        ...docData
      } as Partial<UserProfile>;
    }
    return null;
  } catch (err) {
    console.warn('[Firebase] Error finding user by phone in Firestore:', err);
    return null;
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfileFromFirestore(uid?: string): Promise<Partial<UserProfile> | null> {
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser && !uid) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const targetUid = uid || currentAuthUser?.uid;
    if (!targetUid) return null;

    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (err) {
    console.warn('[Firebase] Could not fetch user profile from Firestore:', err);
    return null;
  }
}

/**
 * Save spin outcome to Firestore
 */
export async function recordSpinToFirestore(spin: SpinResult, uid?: string): Promise<void> {
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const finalUid = currentAuthUser?.uid || uid;
    if (!finalUid) return;

    const spinRef = doc(db, 'spins', spin.id);
    await setDoc(spinRef, {
      ...spin,
      userId: finalUid,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[Firebase] Could not record spin to Firestore:', err);
  }
}

/**
 * Real-time listener for user spins
 */
export function listenToUserSpins(
  uid?: string,
  callback?: (spins: SpinResult[]) => void
): () => void {
  try {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid || !callback) return () => {};

    const spinsRef = collection(db, 'spins');
    const q = query(spinsRef, where('userId', '==', currentUid), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: SpinResult[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as SpinResult);
        });
        results.sort((a, b) => b.timestamp - a.timestamp);
        callback(results);
      },
      (err) => {
        console.warn('[Firebase] Error listening to spins:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup spins listener:', err);
    return () => {};
  }
}

/**
 * Post chat message to Firestore
 */
export async function sendChatMessageToFirestore(
  message: Omit<ChatMessage, 'id'>,
  uid?: string
): Promise<string | null> {
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const finalUid = currentAuthUser?.uid || uid;
    if (!finalUid) return null;

    const chatCol = collection(db, 'chat_messages');
    const docRef = await addDoc(chatCol, {
      ...message,
      userId: finalUid,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn('[Firebase] Could not send chat message to Firestore:', err);
    return null;
  }
}

/**
 * Listen to real-time chat messages
 */
export function listenToChatMessages(callback: (messages: ChatMessage[]) => void): () => void {
  try {
    const chatCol = collection(db, 'chat_messages');
    const q = query(chatCol, limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messages.push({
            id: docSnap.id,
            username: data.username,
            avatar: data.avatar,
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            vipTier: data.vipTier,
            isSystem: data.isSystem,
            tip: data.tip
          });
        });
        messages.sort((a, b) => a.timestamp - b.timestamp);
        if (messages.length > 0) {
          callback(messages);
        }
      },
      (err) => {
        console.warn('[Firebase] Error listening to chat messages:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup chat listener:', err);
    return () => {};
  }
}

/**
 * Synchronize and ensure user admin connection to Firebase
 */
export async function syncAdminToFirebase(adminUser: UserProfile): Promise<boolean> {
  try {
    let currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      currentAuthUser = await ensureFirebaseAuth();
    }
    const uid = currentAuthUser?.uid || adminUser.id || 'admin_beamlak';
    const email = adminUser.email || 'beamlakub9@gmail.com';

    // 1. Sync to /users/{uid}
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        ...adminUser,
        id: uid,
        email,
        role: 'admin',
        isAdmin: true,
        updatedAt: Date.now()
      },
      { merge: true }
    );

    // 2. Sync to /admins/{uid}
    const adminRef = doc(db, 'admins', uid);
    await setDoc(
      adminRef,
      {
        userId: uid,
        email,
        role: 'admin',
        grantedAt: Date.now(),
        grantedBy: 'system_root'
      },
      { merge: true }
    );

    console.info('[Firebase] Admin user connected to Firestore database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (err) {
    console.warn('[Firebase] Notice connecting admin to Firebase:', err);
    return false;
  }
}

/**
 * Real-time listener for all registered users in Firestore (Admin view)
 */
export function listenToAllUsers(callback: (users: UserProfile[]) => void): () => void {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          users.push({
            id: docSnap.id,
            email: data.email || '',
            name: data.name || data.username || 'Player',
            username: data.username || data.name || 'Anonymous',
            phoneNumber: data.phoneNumber || data.telebirrNumber || '',
            telebirrNumber: data.telebirrNumber || data.phoneNumber || '',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
            address: data.address || '',
            connected: true,
            isAuthenticated: true,
            authProvider: data.authProvider || 'guest',
            balances: data.balances || { CBE: 0, Telebirr: 0 },
            vipTier: data.vipTier || 'Bronze',
            vipPoints: data.vipPoints || 0,
            clientSeed: data.clientSeed || '',
            role: data.role || 'user',
            isAdmin: data.isAdmin || data.role === 'admin' || isAdminEmail(data.email),
            createdAt: data.createdAt || data.updatedAt || Date.now()
          });
        });
        callback(users);
      },
      (err) => {
        console.warn('[Firebase] Error listening to users collection:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup users listener:', err);
    return () => {};
  }
}

/**
 * Real-time listener for all spins (Admin provably fair audit trail)
 */
export function listenToAllSpins(callback: (spins: SpinResult[]) => void): () => void {
  try {
    const spinsCol = collection(db, 'spins');
    const q = query(spinsCol, orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const spins: SpinResult[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          spins.push({
            id: docSnap.id,
            mode: data.mode || 'fortune',
            username: data.username || 'Player',
            avatar: data.avatar || '',
            wager: data.wager || 0,
            currency: data.currency || 'CBE',
            wagerUSD: data.wagerUSD || data.wager || 0,
            multiplier: data.multiplier || 0,
            payout: data.payout || 0,
            payoutUSD: data.payoutUSD || data.payout || 0,
            timestamp: data.timestamp || Date.now(),
            serverSeedHash: data.serverSeedHash || '',
            clientSeed: data.clientSeed || '',
            nonce: data.nonce || 0,
            resultDetails: data.resultDetails || {}
          });
        });
        callback(spins);
      },
      (err) => {
        console.warn('[Firebase] Error listening to spins:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup spins listener:', err);
    return () => {};
  }
}

/**
 * Admin action: update player balances in Firestore
 */
export async function adminUpdateUserBalance(
  userId: string,
  balances: Record<CryptoCurrency, number>
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { balances, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase] Admin balance update notice:', err);
    return false;
  }
}

/**
 * Admin action: broadcast official announcement to chat
 */
export async function adminBroadcastSystemMessage(text: string, adminName: string = 'Yene Birr Admin'): Promise<boolean> {
  try {
    const chatCol = collection(db, 'chat_messages');
    await addDoc(chatCol, {
      username: adminName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      text: `📢 [ADMIN ANNOUNCEMENT]: ${text}`,
      timestamp: Date.now(),
      vipTier: 'Diamond',
      isSystem: true,
      userId: auth.currentUser?.uid || 'admin_root',
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Broadcast message notice:', err);
    return false;
  }
}
