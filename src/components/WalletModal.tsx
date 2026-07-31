import React, { useState } from 'react';
import { X, Wallet, ArrowDownRight, ArrowUpRight, History, Copy, Check, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, CryptoCurrency, WalletType, CryptoTransaction } from '../types';
import { sounds } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTab?: 'deposit' | 'withdraw' | 'transactions';
  onConnectWallet?: (walletType: WalletType, address: string) => void;
  onDisconnectWallet?: () => void;
  onDeposit: (currency: CryptoCurrency, amount: number, network: string) => Promise<void>;
  onWithdraw: (currency: CryptoCurrency, amount: number, address: string, network: string) => Promise<void>;
  transactions: CryptoTransaction[];
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  initialTab = 'deposit',
  onConnectWallet,
  onDisconnectWallet,
  onDeposit,
  onWithdraw,
  transactions
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transactions'>(initialTab);
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>('CBE');
  const [depositAmount, setDepositAmount] = useState<number>(200);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1.0);
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const sampleAddresses: Record<string, string> = {
    CBE: '1000123456789',
    Telebirr: '0911223344'
  };

  const currentAddress = sampleAddresses[selectedCurrency] || '1000123456789';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    sounds.playChip();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    setIsProcessing(true);
    sounds.playChip();
    await onDeposit(selectedCurrency, depositAmount, `${selectedCurrency} Mainnet`);
    setIsProcessing(false);
    sounds.playWin(false);
    setActiveTab('transactions');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || !withdrawAddress) return;
    if (user.balances[selectedCurrency] < withdrawAmount) {
      alert(`Insufficient ${selectedCurrency} balance!`);
      return;
    }
    setIsProcessing(true);
    sounds.playChip();
    await onWithdraw(selectedCurrency, withdrawAmount, withdrawAddress, `${selectedCurrency} Mainnet`);
    setIsProcessing(false);
    sounds.playWin(false);
    setActiveTab('transactions');
  };

  const handleSimulatedConnect = (type: WalletType) => {
    sounds.playChip();
    const mockAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    onConnectWallet(type, mockAddr);
    setActiveTab('deposit');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white font-mono">Birr Account & Wallet Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('deposit'); sounds.playChip(); }}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'deposit'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Deposit Birr
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); sounds.playChip(); }}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'withdraw'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Withdraw Funds
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); sounds.playChip(); }}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'transactions'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Deposit */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Select Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['CBE', 'Telebirr'] as CryptoCurrency[]).map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => { setSelectedCurrency(curr); sounds.playChip(); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        selectedCurrency === curr
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Address Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{selectedCurrency} Account Number</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Instant Confirmation</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-xs text-amber-400 truncate flex-1">{sampleAddresses[selectedCurrency]}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Instant Deposit Form */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400 font-medium block">Deposit Amount</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Min: 200 {selectedCurrency}
                    </span>
                    <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      Max Balance: 100,000 Birr
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || depositAmount <= 0}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0"
                  >
                    {isProcessing ? 'Processing...' : 'Deposit Funds'}
                  </button>
                </div>

                <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                  <span className="text-amber-400 text-xs">💡</span>
                  <p className="text-xs font-semibold text-amber-300">
                    masgebat yemtclute ke 200 birr belay new
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Withdraw */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['CBE', 'Telebirr'] as CryptoCurrency[]).map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => { setSelectedCurrency(curr); sounds.playChip(); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        selectedCurrency === curr
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Destination Phone / Account Number</label>
                <input
                  type="text"
                  placeholder={`Enter your ${selectedCurrency} number...`}
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Withdrawal Amount</span>
                  <span>Balance: {user.balances[selectedCurrency].toFixed(2)} {selectedCurrency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.01}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(user.balances[selectedCurrency])}
                    className="bg-slate-800 text-amber-400 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="font-mono text-slate-200">0.00 ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="text-emerald-400 font-bold">Instant Payout</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
              </button>
            </form>
          )}

          {/* TAB 4: Transactions */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction History</div>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">No transactions recorded yet.</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 capitalize block">{tx.type} ({tx.currency})</span>
                        <span className="text-[10px] text-slate-400 font-mono">Hash: {tx.txHash.substring(0, 10)}...</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-200 block">
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
