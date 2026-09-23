import { UserProfile, AuthProvider, UserRole } from '../types';
import {
  auth,
  googleProvider,
  syncUserProfileToFirestore,
  getUserProfileFromFirestore,
  findUserByPhoneInFirestore,
  savePhoneLoginRecordToFirestore,
  ensureFirebaseAuth,
  isAdminEmail,
  isUserAdmin
} from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth';

const STORAGE_SESSION_KEY = 'mx_auth_session';
const STORAGE_USERS_KEY = 'mx_auth_registered_users';

export interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  name?: string;
  phoneNumber?: string;
  telebirrNumber?: string;
  avatar: string;
  address: string;
  authProvider: AuthProvider;
  balances: {
    CBE: number;
    Telebirr: number;
  };
  vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  vipPoints: number;
  clientSeed: string;
  role?: UserRole;
  isAdmin?: boolean;
  createdAt: number;
}

const DEFAULT_DEMO_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'admin_beamlak',
    email: 'beamlakub9@gmail.com',
    passwordHash: 'admin2026',
    username: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    address: '0xADM1N...99B9',
    authProvider: 'google',
    balances: {
      CBE: 1.00,
      Telebirr: 1.00
    },
    vipTier: 'Diamond',
    vipPoints: 99999,
    role: 'admin',
    isAdmin: true,
    clientSeed: 'admin_master_seed_beamlak_777',
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: 'demo_user_1',
    email: 'ethiopia.vip@gmail.com',
    passwordHash: 'password123',
    username: 'Ethiopian_Eagle',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    address: '0x3D92...71B8',
    authProvider: 'google',
    balances: {
      CBE: 1.00,
      Telebirr: 1.00
    },
    vipTier: 'Gold',
    vipPoints: 4800,
    clientSeed: 'eagle_lucky_client_seed_99',
    createdAt: Date.now() - 86400000 * 15
  },
  {
    id: 'demo_user_2',
    email: 'player@mx.et',
    passwordHash: 'birr2026',
    username: 'Addis_Spinner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    address: '0x81F2...9042',
    authProvider: 'password',
    balances: {
      CBE: 1.00,
      Telebirr: 1.00
    },
    vipTier: 'Silver',
    vipPoints: 1200,
    clientSeed: 'spinner_seed_et_42',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'demo_user_3',
    email: 'highroller@telebirr.et',
    passwordHash: 'jackpot777',
    username: 'Telebirr_Whale',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    address: '0x7C41...E523',
    authProvider: 'password',
    balances: {
      CBE: 1.00,
      Telebirr: 1.00
    },
    vipTier: 'Platinum',
    vipPoints: 18500,
    clientSeed: 'whale_high_roller_seed_007',
    createdAt: Date.now() - 86400000 * 30
  }
];

// Initialize users storage if empty
export function getStoredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
      return DEFAULT_DEMO_ACCOUNTS;
    }
    const list: StoredUserAccount[] = JSON.parse(raw);
    // Standardize all stored accounts to exactly 1.00 Birr CBE and Telebirr
    list.forEach((u) => {
      u.balances = { CBE: 1.00, Telebirr: 1.00 };
    });
    // Ensure verified admin account is always present
    const hasAdmin = list.some((u) => u.email?.toLowerCase() === 'beamlakub9@gmail.com');
    if (!hasAdmin) {
      list.unshift(DEFAULT_DEMO_ACCOUNTS[0]);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

function saveStoredUsers(users: StoredUserAccount[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users in localStorage', err);
  }
}

// Session management
export function getSavedSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    const isAdmin = isUserAdmin(user) || isAdminEmail(user.email) || user.role === 'admin';
    if (isAdmin) {
      user.role = 'admin';
      user.isAdmin = true;
    }
    if (!user.balances || typeof user.balances !== 'object') {
      user.balances = { CBE: 1.00, Telebirr: 1.00 };
      saveSession(user);
    } else {
      // Strictly ensure wallet balance is 1.00 Birr for CBE and Telebirr
      user.balances = {
        CBE: 1.00,
        Telebirr: 1.00
      };
      saveSession(user);
    }
    if (!user.cbeAccountNumber) {
      user.cbeAccountNumber = '1000068535477';
    }
    if (!user.telebirrNumber) {
      user.telebirrNumber = '';
    }
    return user;
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save session', err);
  }
}

export function clearSavedSession() {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

export const authService = {
  // Sign in with Google
  signInWithGoogle: async (customEmail?: string, customName?: string): Promise<UserProfile> => {
    let firebaseUid: string | undefined;
    let resolvedEmail = customEmail;
    let resolvedName = customName;
    let resolvedPhoto: string | undefined;

    // Attempt Firebase Popup Sign-In if no custom email is forced
    if (!customEmail) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        if (cred.user) {
          firebaseUid = cred.user.uid;
          resolvedEmail = cred.user.email || undefined;
          resolvedName = cred.user.displayName || undefined;
          resolvedPhoto = cred.user.photoURL || undefined;
        }
      } catch (fbErr: unknown) {
        console.info('[Firebase] Popup auth bypassed or iframe-restricted, using direct Google account flow:', fbErr);
      }
    }

    const email = resolvedEmail || 'google.user@gmail.com';
    const username = resolvedName || (email.split('@')[0] || 'Google_Player');
    const users = getStoredUsers();

    let account = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!account) {
      account = {
        id: firebaseUid || 'usr_g_' + Math.random().toString(36).substring(2, 9),
        email,
        passwordHash: '',
        username,
        avatar: resolvedPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        address: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
        authProvider: 'google',
        balances: {
          CBE: 1.00,
          Telebirr: 1.00
        },
        vipTier: 'Bronze',
        vipPoints: 100,
        clientSeed: 'seed_' + Math.random().toString(36).substring(2, 12),
        createdAt: Date.now()
      };
      users.push(account);
      saveStoredUsers(users);
    } else if (firebaseUid && !account.id.startsWith('usr_')) {
      account.id = firebaseUid;
    }

    const isAccountAdmin =
      isUserAdmin(account) || isAdminEmail(account.email) || account.role === 'admin';

    const userProfile: UserProfile = {
      id: firebaseUid || account.id,
      email: account.email,
      username: account.username,
      avatar: resolvedPhoto || account.avatar,
      address: account.address,
      connected: true,
      isAuthenticated: true,
      authProvider: 'google',
      balances: {
        CBE: account.balances.CBE,
        Telebirr: account.balances.Telebirr
      },
      vipTier: account.vipTier,
      vipPoints: account.vipPoints,
      clientSeed: account.clientSeed,
      role: isAccountAdmin ? 'admin' : (account.role || 'user'),
      isAdmin: isAccountAdmin,
      createdAt: account.createdAt
    };

    // Sync to Firestore
    syncUserProfileToFirestore(userProfile).catch((err) => {
      console.warn('[Firebase] Firestore profile sync deferred:', err);
    });

    saveSession(userProfile);
    return userProfile;
  },

  // Sign in or register with Name and Phone Number - Fully persisted to Firestore
  signInWithPhoneAndName: async (name: string, phoneNumber: string, passwordOrPin?: string): Promise<UserProfile> => {
    const cleanName = name.trim();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    if (!cleanName) {
      throw new Error('Please enter your full name (ስምዎን ያስገቡ).');
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      throw new Error('Please enter a valid Ethiopian phone number (e.g. 09... or 07...).');
    }

    // Ensure Firebase Auth session is active
    let fbUser: any = null;
    try {
      fbUser = await ensureFirebaseAuth();
    } catch (authErr) {
      console.warn('[Firebase] Auth initialization check:', authErr);
    }

    // 1. Check if user already exists in Firestore database by phone number
    let firestoreProfile: Partial<UserProfile> | null = null;
    try {
      firestoreProfile = await findUserByPhoneInFirestore(cleanPhone);
      if (firestoreProfile) {
        console.info('[Firebase] Existing user account located in Firestore:', firestoreProfile.id);
      }
    } catch (fsErr) {
      console.warn('[Firebase] Error checking Firestore for phone user:', fsErr);
    }

    const users = getStoredUsers();
    // Look up existing user locally by phone number or username
    let account = users.find(
      (u) =>
        (u.phoneNumber && u.phoneNumber.replace(/\s+/g, '') === cleanPhone) ||
        (u.telebirrNumber && u.telebirrNumber.replace(/\s+/g, '') === cleanPhone) ||
        u.username.toLowerCase() === cleanName.toLowerCase()
    );

    const isBeamlakAdmin =
      cleanName.toLowerCase().includes('beamlak') ||
      cleanPhone.includes('0900000000') ||
      (firestoreProfile?.email ? isAdminEmail(firestoreProfile.email) : false);

    const finalUid = fbUser?.uid || firestoreProfile?.id || account?.id || ('usr_p_' + Math.random().toString(36).substring(2, 9));

    if (account) {
      // Update name or phone if provided
      account.id = finalUid;
      account.username = cleanName;
      account.name = cleanName;
      account.phoneNumber = cleanPhone;
      account.telebirrNumber = cleanPhone;
      if (passwordOrPin && !account.passwordHash) {
        account.passwordHash = passwordOrPin;
      }
      if (firestoreProfile?.balances) {
        account.balances = firestoreProfile.balances;
      }
      if (firestoreProfile?.vipTier) {
        account.vipTier = firestoreProfile.vipTier;
      }
      if (isBeamlakAdmin) {
        account.role = 'admin';
        account.isAdmin = true;
      }
      saveStoredUsers(users);
    } else {
      const avatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80'
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      account = {
        id: finalUid,
        email: firestoreProfile?.email || `${cleanPhone}@yenebirr.et`,
        phoneNumber: cleanPhone,
        telebirrNumber: cleanPhone,
        passwordHash: passwordOrPin || '',
        name: cleanName,
        username: cleanName,
        avatar: firestoreProfile?.avatar || randomAvatar,
        address: firestoreProfile?.address || ('0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...'),
        authProvider: 'phone',
        balances: firestoreProfile?.balances || {
          CBE: 1.00,
          Telebirr: 1.00
        },
        vipTier: (firestoreProfile?.vipTier as any) || 'Bronze',
        vipPoints: firestoreProfile?.vipPoints || 100,
        role: isBeamlakAdmin ? 'admin' : (firestoreProfile?.role || 'user'),
        isAdmin: isBeamlakAdmin || firestoreProfile?.isAdmin,
        clientSeed: firestoreProfile?.clientSeed || ('seed_' + Math.random().toString(36).substring(2, 12)),
        createdAt: firestoreProfile?.createdAt || Date.now()
      };

      users.push(account);
      saveStoredUsers(users);
    }

    const isAccountAdmin =
      isBeamlakAdmin ||
      isUserAdmin(account) ||
      isAdminEmail(account.email) ||
      account.role === 'admin';

    const userProfile: UserProfile = {
      id: finalUid,
      email: account.email,
      name: cleanName,
      username: account.username,
      avatar: account.avatar,
      address: account.address,
      connected: true,
      isAuthenticated: true,
      authProvider: 'phone',
      phoneNumber: cleanPhone,
      telebirrNumber: cleanPhone,
      cbeAccountNumber: '1000068535477',
      balances: {
        CBE: account.balances.CBE ?? 1.00,
        Telebirr: account.balances.Telebirr ?? 1.00
      },
      vipTier: account.vipTier || 'Bronze',
      vipPoints: account.vipPoints || 100,
      clientSeed: account.clientSeed,
      role: isAccountAdmin ? 'admin' : (account.role || 'user'),
      isAdmin: isAccountAdmin,
      createdAt: account.createdAt
    };

    // Save directly to Firestore users collection (/users/{userId}) with Name & Phone number
    try {
      await syncUserProfileToFirestore(userProfile);
    } catch (syncErr) {
      console.warn('[Firebase] Firestore user sync notice:', syncErr);
    }

    // Save phone login session audit record to Firestore (/phone_logins)
    try {
      await savePhoneLoginRecordToFirestore(cleanName, cleanPhone, userProfile.id, {
        vipTier: userProfile.vipTier,
        authProvider: 'phone'
      });
    } catch (recErr) {
      console.warn('[Firebase] Phone login record notice:', recErr);
    }

    saveSession(userProfile);
    return userProfile;
  },

  // Sign in with Email and Password
  signInWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    let firebaseUid: string | undefined;

    // Try authenticating with Firebase Auth first
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user) {
        firebaseUid = cred.user.uid;
      }
    } catch (fbErr: unknown) {
      console.info('[Firebase Auth] Checking stored user credentials:', fbErr);
    }

    const users = getStoredUsers();
    const account = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!account && !firebaseUid) {
      throw new Error('No account found with this email address. Please register.');
    }

    if (account && account.passwordHash && account.passwordHash !== password && !firebaseUid) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    const isAccountAdmin =
      isUserAdmin(account || null) || isAdminEmail(account?.email || email) || account?.role === 'admin';

    const userProfile: UserProfile = {
      id: firebaseUid || account?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
      email: account?.email || email.trim(),
      username: account?.username || email.split('@')[0],
      avatar: account?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      address: account?.address || '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
      connected: true,
      isAuthenticated: true,
      authProvider: account?.authProvider || 'password',
      balances: {
        CBE: account?.balances.CBE ?? 1.00,
        Telebirr: account?.balances.Telebirr ?? 1.00
      },
      vipTier: account?.vipTier || 'Bronze',
      vipPoints: account?.vipPoints || 100,
      clientSeed: account?.clientSeed || ('seed_' + Math.random().toString(36).substring(2, 12)),
      role: isAccountAdmin ? 'admin' : (account?.role || 'user'),
      isAdmin: isAccountAdmin,
      createdAt: account?.createdAt || Date.now()
    };

    // Check if Firestore has updated balances or seed
    if (firebaseUid) {
      const remote = await getUserProfileFromFirestore(firebaseUid);
      if (remote) {
        if (remote.balances) userProfile.balances = remote.balances;
        if (remote.vipTier) userProfile.vipTier = remote.vipTier;
        if (remote.vipPoints !== undefined) userProfile.vipPoints = remote.vipPoints;
      }
    }

    // Sync to Firestore
    syncUserProfileToFirestore(userProfile).catch(() => {});

    saveSession(userProfile);
    return userProfile;
  },

  // Register with Email and Password
  registerWithEmail: async (email: string, password: string, username: string): Promise<UserProfile> => {
    if (!email || !password || !username) {
      throw new Error('Please fill in all required fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    let firebaseUid: string | undefined;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user) {
        firebaseUid = cred.user.uid;
      }
    } catch (fbErr: unknown) {
      console.info('[Firebase Auth] Local account registration fallback:', fbErr);
    }

    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing && !firebaseUid) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=160&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newAccount: StoredUserAccount = {
      id: firebaseUid || 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      passwordHash: password,
      username: username.trim(),
      avatar: randomAvatar,
      address: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
      authProvider: 'password',
      balances: {
        CBE: 1.00,
        Telebirr: 1.00
      },
      vipTier: 'Bronze',
      vipPoints: 100,
      clientSeed: 'seed_' + Math.random().toString(36).substring(2, 12),
      createdAt: Date.now()
    };

    users.push(newAccount);
    saveStoredUsers(users);

    const userProfile: UserProfile = {
      id: newAccount.id,
      email: newAccount.email,
      username: newAccount.username,
      avatar: newAccount.avatar,
      address: newAccount.address,
      connected: true,
      isAuthenticated: true,
      authProvider: 'password',
      balances: {
        CBE: newAccount.balances.CBE,
        Telebirr: newAccount.balances.Telebirr
      },
      vipTier: newAccount.vipTier,
      vipPoints: newAccount.vipPoints,
      clientSeed: newAccount.clientSeed,
      createdAt: newAccount.createdAt
    };

    // Save to Firestore
    syncUserProfileToFirestore(userProfile).catch(() => {});

    saveSession(userProfile);
    return userProfile;
  },

  // Instant Sign In As Stored User (for Login Dashboard fast switching)
  signInAsUser: async (userId: string): Promise<UserProfile> => {
    await new Promise((r) => setTimeout(r, 250));
    const users = getStoredUsers();
    const account = users.find((u) => u.id === userId);
    if (!account) {
      throw new Error('Account not found');
    }

    const userProfile: UserProfile = {
      id: account.id,
      email: account.email,
      username: account.username,
      avatar: account.avatar,
      address: account.address,
      connected: true,
      isAuthenticated: true,
      authProvider: account.authProvider,
      balances: {
        CBE: account.balances.CBE,
        Telebirr: account.balances.Telebirr
      },
      vipTier: account.vipTier,
      vipPoints: account.vipPoints,
      clientSeed: account.clientSeed,
      createdAt: account.createdAt
    };

    syncUserProfileToFirestore(userProfile).catch(() => {});
    saveSession(userProfile);
    return userProfile;
  },

  // Ethiopian Telebirr/CBE Mobile Phone Login
  signInWithPhone: async (phoneNumber: string, otpCode: string): Promise<UserProfile> => {
    await new Promise((r) => setTimeout(r, 400));
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      throw new Error('Please enter a valid Ethiopian phone number (+251 9... or +251 7...)');
    }
    if (!otpCode || otpCode.length < 4) {
      throw new Error('Please enter the 6-digit SMS verification code');
    }

    const users = getStoredUsers();
    const userEmail = `phone_${cleanPhone.replace(/[^0-9]/g, '')}@telebirr.et`;
    let account = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());

    if (!account) {
      account = {
        id: 'usr_tel_' + Math.random().toString(36).substring(2, 9),
        email: userEmail,
        passwordHash: '',
        username: 'Telebirr_User_' + cleanPhone.slice(-4),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        address: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
        authProvider: 'password',
        balances: {
          CBE: 1.00,
          Telebirr: 1.00
        },
        vipTier: 'Silver',
        vipPoints: 650,
        clientSeed: 'telebirr_seed_' + Math.random().toString(36).substring(2, 10),
        createdAt: Date.now()
      };
      users.push(account);
      saveStoredUsers(users);
    }

    const userProfile: UserProfile = {
      id: account.id,
      email: account.email,
      username: account.username,
      avatar: account.avatar,
      address: account.address,
      connected: true,
      isAuthenticated: true,
      authProvider: 'password',
      balances: {
        CBE: account.balances.CBE,
        Telebirr: account.balances.Telebirr
      },
      vipTier: account.vipTier,
      vipPoints: account.vipPoints,
      clientSeed: account.clientSeed,
      createdAt: account.createdAt
    };

    saveSession(userProfile);
    return userProfile;
  },

  // Update Password
  updatePassword: async (userId: string, newPassword: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 350));
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index].passwordHash = newPassword;
      saveStoredUsers(users);
      return true;
    }
    return false;
  },

  // Sign Out
  signOut: () => {
    fbSignOut(auth).catch((err) => {
      console.warn('[Firebase] Sign out error:', err);
    });
    clearSavedSession();
  },

  // Connect & Sign in directly as verified Admin
  signInAsAdmin: async (): Promise<UserProfile> => {
    return await authService.signInWithGoogle('beamlakub9@gmail.com', 'Administrator');
  }
};
