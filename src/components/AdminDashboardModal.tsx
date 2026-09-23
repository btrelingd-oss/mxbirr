import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Database,
  Users,
  Activity,
  Coins,
  Send,
  RefreshCw,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UserProfile, SpinResult, CryptoCurrency } from '../types';
import {
  listenToAllUsers,
  listenToAllSpins,
  adminUpdateUserBalance,
  adminBroadcastSystemMessage,
  syncAdminToFirebase,
  ADMIN_EMAILS
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { sounds } from '../utils/audio';

interface AdminDashboardModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onUserUpdated?: (updated: UserProfile) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'spins' | 'broadcast'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [spins, setSpins] = useState<SpinResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Edit balance state
  const [editCbe, setEditCbe] = useState<string>('');
  const [editTelebirr, setEditTelebirr] = useState<string>('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [balanceSuccess, setBalanceSuccess] = useState(false);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Sync admin state
  const [isSyncingAdmin, setIsSyncingAdmin] = useState(false);
  const [adminSyncSuccess, setAdminSyncSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Listen to all users from Firestore
    const unsubUsers = listenToAllUsers((loadedUsers) => {
      setUsers(loadedUsers);
    });

    // Listen to all spins from Firestore
    const unsubSpins = listenToAllSpins((loadedSpins) => {
      setSpins(loadedSpins);
    });

    return () => {
      unsubUsers();
      unsubSpins();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = (u: UserProfile) => {
    setSelectedUser(u);
    setEditCbe(u.balances.CBE.toString());
    setEditTelebirr(u.balances.Telebirr.toString());
    setBalanceSuccess(false);
    sounds.playChip();
  };

  const handleSaveUserBalances = async () => {
    if (!selectedUser?.id) return;
    try {
      setIsUpdatingBalance(true);
      const cbeNum = parseFloat(editCbe) || 0;
      const teleNum = parseFloat(editTelebirr) || 0;
      const newBalances: Record<CryptoCurrency, number> = {
        CBE: cbeNum,
        Telebirr: teleNum
      };

      const success = await adminUpdateUserBalance(selectedUser.id, newBalances);
      if (success) {
        setBalanceSuccess(true);
        sounds.playWin();
        if (selectedUser.id === currentUser.id && onUserUpdated) {
          onUserUpdated({
            ...currentUser,
            balances: newBalances
          });
        }
        setTimeout(() => setBalanceSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      setIsBroadcasting(true);
      const ok = await adminBroadcastSystemMessage(
        broadcastText.trim(),
        'System Admin'
      );
      if (ok) {
        setBroadcastSuccess(true);
        setBroadcastText('');
        sounds.playWin();
        setTimeout(() => setBroadcastSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSyncAdminDirectly = async () => {
    try {
      setIsSyncingAdmin(true);
      const ok = await syncAdminToFirebase({
        ...currentUser,
        email: currentUser.email || 'beamlakub9@gmail.com',
        role: 'admin',
        isAdmin: true
      });
      if (ok) {
        setAdminSyncSuccess(true);
        sounds.playWin();
        setTimeout(() => setAdminSyncSuccess(false), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingAdmin(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
      (u.telebirrNumber && u.telebirrNumber.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  const totalCbeInCirculation = users.reduce((sum, u) => sum + (u.balances?.CBE || 0), 0);
  const totalTelebirrInCirculation = users.reduce((sum, u) => sum + (u.balances?.Telebirr || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Firebase Admin Command Center</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Admin Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Admin: <span className="text-amber-300 font-mono">{currentUser.email || 'beamlakub9@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAdminDirectly}
              disabled={isSyncingAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
              title="Force sync admin role to Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAdmin ? 'animate-spin text-amber-400' : ''}`} />
              {isSyncingAdmin ? 'Syncing...' : 'Sync Admin to Firebase'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Database Status Bar */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Firestore DB:</span>
            <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              {firebaseConfig.firestoreDatabaseId || '(default)'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Project: <strong className="text-slate-200">{firebaseConfig.projectId}</strong></span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </div>

        {/* Admin Sync Alert */}
        {adminSyncSuccess && (
          <div className="px-6 py-2 bg-emerald-950/50 border-b border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Admin user credentials successfully verified and written to Firestore (`/users` & `/admins`) collections!
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Player Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('spins')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'spins'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            Live Spin Audit Trail ({spins.length})
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'broadcast'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Chat Broadcast
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Firestore Users</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Real-time profile records</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Spins Logged</span>
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{spins.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Immutable audit entries</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">CBE in Circulation</span>
                    <span className="text-sm">🏦</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {totalCbeInCirculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-slate-300">ETB</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Across all registered wallets</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Telebirr in Circulation</span>
                    <span className="text-sm">📱</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-400">
                    {totalTelebirrInCirculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-slate-300">ETB</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Across all registered wallets</p>
                </div>
              </div>

              {/* Admin Privileges Info */}
              <div className="p-5 bg-gradient-to-r from-amber-950/20 via-slate-800/40 to-slate-800/40 border border-amber-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  Firebase Administrator Authority Details
                </div>
                <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <p>
                    • <strong>Primary Admin Email:</strong> <span className="text-amber-300 font-mono">{ADMIN_EMAILS.join(', ')}</span>
                  </p>
                  <p>
                    • <strong>Firestore Security Rules:</strong> Attribute-Based Access Control (ABAC) recognizes this email and grants root read/write privileges over <code className="text-slate-200">/users</code>, <code className="text-slate-200">/admins</code>, <code className="text-slate-200">/spins</code>, and <code className="text-slate-200">/chat_messages</code>.
                  </p>
                  <p>
                    • <strong>Provably Fair Seed Authority:</strong> All player nonce cycles and HMAC-SHA256 hashes are verifiable directly from the live spin audit trail.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleSyncAdminDirectly}
                    disabled={isSyncingAdmin}
                    className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAdmin ? 'animate-spin' : ''}`} />
                    {isSyncingAdmin ? 'Syncing to Firestore...' : 'Ensure Admin Record in Firebase'}
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Manage Players & Balances
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* User List (Left) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username, email or ID..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 max-h-[420px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No users found matching query.
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      const isUserAdminAcc = u.role === 'admin' || u.isAdmin || u.email === 'beamlakub9@gmail.com';
                      return (
                        <div
                          key={u.id || u.username}
                          onClick={() => handleSelectUser(u)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                              alt={u.username}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white">{u.name || u.username}</span>
                                {isUserAdminAcc && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                                    ADMIN
                                  </span>
                                )}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                  {u.vipTier}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                                {u.phoneNumber ? `📱 +251 ${u.phoneNumber}` : (u.email || u.id)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-semibold text-emerald-400">
                              {(u.balances?.CBE || 0).toLocaleString()} <span className="text-[10px] text-slate-400">CBE</span>
                            </div>
                            <div className="text-xs font-semibold text-amber-400">
                              {(u.balances?.Telebirr || 0).toLocaleString()} <span className="text-[10px] text-slate-400">Telebirr</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* User Edit / Details (Right) */}
              <div className="lg:col-span-5 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
                {selectedUser ? (
                  <>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
                      />
                      <div className="truncate">
                        <div className="font-bold text-sm text-white truncate">{selectedUser.name || selectedUser.username}</div>
                        {selectedUser.phoneNumber && (
                          <div className="text-xs text-amber-400 font-mono font-semibold">
                            📱 Phone: +251 {selectedUser.phoneNumber}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 font-mono truncate">{selectedUser.email || selectedUser.id}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">VIP Tier: {selectedUser.vipTier} ({selectedUser.vipPoints} pts)</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Admin Balance Adjustment (Firestore)
                      </label>
                      
                      <div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                          🏦 CBE Birr Balance:
                        </span>
                        <input
                          type="number"
                          value={editCbe}
                          onChange={(e) => setEditCbe(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                          📱 Telebirr Balance:
                        </span>
                        <input
                          type="number"
                          value={editTelebirr}
                          onChange={(e) => setEditTelebirr(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Set:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditCbe('1.00');
                            setEditTelebirr('1.00');
                          }}
                          className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 rounded-md text-[11px] font-bold transition-colors"
                        >
                          1.00 Birr
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditCbe('100.00');
                            setEditTelebirr('100.00');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-[11px] font-bold transition-colors"
                        >
                          100 Birr
                        </button>
                      </div>

                      {balanceSuccess && (
                        <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          Updated balances saved to Firestore!
                        </div>
                      )}

                      <button
                        onClick={handleSaveUserBalances}
                        disabled={isUpdatingBalance}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        {isUpdatingBalance ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Writing to Firestore...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Commit Changes to Firestore
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    Select a player from the list to view profile details and adjust wallet balances.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SPINS AUDIT */}
          {activeTab === 'spins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Real-time Provably Fair Audit Records from Firestore (/spins)</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Auditing
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 max-h-[480px] overflow-y-auto">
                {spins.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No spins logged in Firestore yet.
                  </div>
                ) : (
                  spins.map((s) => {
                    const isWin = s.payout > 0;
                    return (
                      <div key={s.id} className="p-3 bg-slate-900/40 hover:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            s.mode === 'fortune' ? 'bg-amber-500/20 text-amber-300' :
                            s.mode === 'slots' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {s.mode}
                          </span>
                          <div>
                            <span className="font-semibold text-white">{s.username}</span>
                            <span className="text-slate-400 ml-2">Wager: {s.wager} {s.currency}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`font-bold ${isWin ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {isWin ? `+${s.payout.toFixed(2)} ${s.currency} (${s.multiplier}x)` : '0.00 ETB (Loss)'}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                              Seed: {s.serverSeedHash.slice(0, 10)}...
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(s.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <p className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  Official System Broadcast to Multiplayer Chat
                </p>
                Broadcasts will instantly appear in all connected players' live chat with a verified <strong className="text-amber-300">[ADMIN ANNOUNCEMENT]</strong> banner.
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Announcement Message
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="E.g.: Attention players: Special 2X VIP Points active for all CBE and Telebirr spins for the next hour!"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {broadcastSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Official announcement broadcasted to Firestore chat successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastText.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isBroadcasting ? 'Broadcasting...' : 'Publish Announcement to All Players'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Logged in as <strong className="text-amber-300 font-mono">{currentUser.username}</strong> ({currentUser.email || 'beamlakub9@gmail.com'})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
