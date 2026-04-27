import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Bell, User, Send, QrCode, FileText, RefreshCw,
  TrendingUp, TrendingDown, Home, BarChart2, Settings, Zap,
  ArrowUpRight, ArrowDownLeft, ChevronRight, Wallet, AlertTriangle,
  CheckCircle, Info
} from 'lucide-react';
import axios from 'axios';

/* ─── Helpers ─── */
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

/* ─── Animated Balance Counter ─── */
const CountUp = ({ target, duration = 1200, hidden }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (hidden) return setVal(target);
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, hidden]);
  return hidden ? '••••••' : `₹${fmt(val)}`;
};

/* ─── Skeleton Loader ─── */
const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#1a1a1a,#242424,#1a1a1a)', backgroundSize: '200%', animation: 'shimmer 1.4s infinite' }} />
);

/* ─── Transaction Item ─── */
const TxnItem = ({ txn }) => {
  const isCredit = txn.type === 'credit';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1A1A1A' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: isCredit ? 'rgba(0,255,156,0.1)' : 'rgba(255,75,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCredit ? <ArrowDownLeft size={18} color="#00FF9C" /> : <ArrowUpRight size={18} color="#FF4B4B" />}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>{txn.description}</p>
          <p style={{ fontSize: 12, color: '#A0A0A0' }}>{txn.category} • {new Date(txn.created_at).toLocaleDateString('en-IN')}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: isCredit ? '#00FF9C' : '#FF4B4B' }}>
          {isCredit ? '+' : '-'}₹{fmt(txn.amount)}
        </p>
        <p style={{ fontSize: 11, color: txn.status === 'success' ? '#00FF9C' : '#FFB800', textTransform: 'capitalize' }}>{txn.status}</p>
      </div>
    </motion.div>
  );
};

/* ─── Insight Card ─── */
const InsightCard = ({ item }) => {
  const colors = { danger: '#FF4B4B', warning: '#FFB800', success: '#00FF9C', info: '#00B3FF' };
  const icons = { danger: <AlertTriangle size={16} />, warning: <AlertTriangle size={16} />, success: <CheckCircle size={16} />, info: <Info size={16} /> };
  const c = colors[item.type] || '#A0A0A0';
  return (
    <div style={{ background: `${c}12`, border: `1px solid ${c}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: c, marginTop: 2 }}>{icons[item.type]}</span>
      <p style={{ fontSize: 13, color: '#E0E0E0', lineHeight: 1.5 }}>{item.message}</p>
    </div>
  );
};

/* ─── Quick Action Button ─── */
const QuickAction = ({ icon, label, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    style={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: 16, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer', transition: 'all 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#00FF9C'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,255,156,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <span style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 500 }}>{label}</span>
  </motion.button>
);

/* ─── Nav Tab ─── */
const NavTab = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{ flex: 1, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '10px 0' }}>
    <span style={{ color: active ? '#00FF9C' : '#555' }}>{icon}</span>
    <span style={{ fontSize: 10, color: active ? '#00FF9C' : '#555', fontWeight: active ? 600 : 400 }}>{label}</span>
  </button>
);

/* ─── Main Dashboard ─── */
const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '999';

  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [summaryRes, insightsRes] = await Promise.all([
        axios.get(`http://localhost:5000/dashboard/summary?userId=${userId}`),
        axios.get(`http://localhost:5000/insights?userId=${userId}`)
      ]);
      if (summaryRes.data.redirect) { navigate(summaryRes.data.redirect); return; }
      setData(summaryRes.data);
      setInsights(insightsRes.data.insights || []);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/kyc-status');
      } else {
        setError('Unable to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const spendingCategories = data?.recentTransactions
    ? Object.entries(
        data.recentTransactions
          .filter(t => t.type === 'debit')
          .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {})
      )
    : [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0B0B0B', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#A0A0A0', fontSize: 13 }}>Good evening,</p>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{loading ? <Skeleton w={120} h={22} /> : (data?.user?.name || 'User')} 👋</h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={18} color="#A0A0A0" />
            </button>
            <button style={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={18} color="#A0A0A0" />
            </button>
          </div>
        </div>

        {/* ── Balance Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ margin: '20px 20px 0', background: 'linear-gradient(135deg, #00FF9C15 0%, #00B36D08 100%)', border: '1px solid #00FF9C22', borderRadius: 24, padding: '24px 22px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 6 }}>Total Balance</p>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
                {loading ? <Skeleton w={180} h={36} /> : (
                  <CountUp target={data?.account?.balance || 0} hidden={balanceHidden} />
                )}
              </h1>
              <span style={{ fontSize: 12, color: '#00FF9C', marginTop: 6, display: 'block' }}>
                {data?.account?.account_type || 'Savings'} Account
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => setBalanceHidden(!balanceHidden)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {balanceHidden ? <EyeOff size={16} color="#A0A0A0" /> : <Eye size={16} color="#00FF9C" />}
              </button>
              <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <RefreshCw size={14} color="#A0A0A0" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ margin: '20px 20px 0', display: 'flex', gap: 10 }}>
          <QuickAction icon={<Send size={20} color="#00FF9C" />} label="Send" onClick={() => navigate('/mepay/pay')} />
          <QuickAction icon={<QrCode size={20} color="#00FF9C" />} label="Scan QR" onClick={() => alert('Scan QR')} />
          <QuickAction icon={<FileText size={20} color="#00FF9C" />} label="Bills" onClick={() => navigate('/mepay')} />
          <QuickAction icon={<Wallet size={20} color="#00FF9C" />} label="Request" onClick={() => alert('Request Money')} />
        </motion.div>

        {/* ── Smart Insights ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ margin: '24px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Smart Insights</h3>
            <Zap size={16} color="#00FF9C" />
          </div>
          {loading ? [1, 2].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={50} r={12} /></div>) :
            insights.map((item, i) => <InsightCard key={i} item={item} />)
          }
        </motion.div>

        {/* ── Spending Analytics ── */}
        {!loading && spendingCategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ margin: '24px 20px 0', background: '#121212', borderRadius: 20, padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Spending Breakdown</h3>
              <button style={{ fontSize: 12, color: '#00FF9C', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View Details <ChevronRight size={12} />
              </button>
            </div>
            {spendingCategories.map(([cat, amt], i) => {
              const total = spendingCategories.reduce((s, [, v]) => s + v, 0);
              const pct = Math.round((amt / total) * 100);
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#A0A0A0' }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>₹{fmt(amt)}</span>
                  </div>
                  <div style={{ height: 6, background: '#1E1E1E', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #00FF9C, #00B36D)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── Recent Transactions ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ margin: '24px 20px 0', background: '#121212', borderRadius: 20, padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Transactions</h3>
            <button style={{ fontSize: 12, color: '#00FF9C', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={12} />
            </button>
          </div>
          {loading
            ? [1, 2, 3].map(i => <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #1A1A1A' }}><Skeleton h={40} r={8} /></div>)
            : !data?.recentTransactions?.length
              ? <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>No transactions yet.</p>
              : data.recentTransactions.map((txn, i) => <TxnItem key={i} txn={txn} />)
          }
        </motion.div>

        {/* ── Error state ── */}
        {error && (
          <div style={{ margin: '20px', background: '#FF4B4B15', border: '1px solid #FF4B4B30', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#FF4B4B', fontSize: 14 }}>{error}</p>
            <button onClick={fetchData} style={{ color: '#00FF9C', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8 }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0E0E0E', borderTop: '1px solid #1E1E1E', display: 'flex', zIndex: 100 }}>
        <NavTab icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavTab icon={<FileText size={20} />} label="Transactions" active={activeTab === 'txns'} onClick={() => setActiveTab('txns')} />
        <NavTab icon={<QrCode size={20} />} label="Scan" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
        <NavTab icon={<BarChart2 size={20} />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        <NavTab icon={<User size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </div>
  );
};

export default Dashboard;
