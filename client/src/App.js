import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, User, Clock, BookOpen, Phone, Mail, LogOut, 
  Plus, Trash2, GraduationCap, Sparkles, ChevronRight, UserPlus, ShieldCheck,
  Megaphone, Pin, MessageSquare, Send, Search, CheckCircle2, AlertCircle, FileText,
  Users, CreditCard, KeyRound, ArrowLeft, Paperclip, Download, LogIn, MapPin, Layout,
  FileSpreadsheet, Printer, TrendingUp, DollarSign, CheckSquare, BarChart3, PieChart, Edit, Repeat, Save, X, Calculator, School
} from 'lucide-react';
import Profile from './profil';
import ScheduleView from './ScheduleView';

const API_BASE = 'https://mentorstudio-backend.onrender.com/api';
const UPLOADS_BASE = 'https://mentorstudio-backend.onrender.com';

const formatLessonTime = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const dateStr = start.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const startStr = start.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

  return `${dateStr} ${startStr} – ${endStr}`;
};

const animations = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
  .fade-in { animation: fadeIn 0.3s ease-out forwards; }
  .btn-hover { transition: all 0.2s ease-in-out; }
  .btn-hover:hover { transform: translateY(-2px); filter: brightness(1.1); }
  .card-hover { transition: all 0.25s ease-in-out; }
  .card-hover:hover { transform: translateY(-3px); border-color: rgba(52, 211, 153, 0.4) !important; }
  @media print {
    body * { visibility: hidden; }
    #printable-log-section, #printable-log-section * { visibility: visible; }
    #printable-log-section { position: absolute; left: 0; top: 0; width: 100%; color: #000 !important; background: #fff !important; }
    .no-print { display: none !important; }
  }
`;

const ui = {
  landingPageContainer: { minHeight: '100vh', backgroundColor: '#060d08', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  publicHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2.5rem', background: 'rgba(9, 20, 14, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', sticky: 'top', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  brandText: { fontSize: '1.35rem', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSection: { padding: '5rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.12) 0%, rgba(6, 13, 8, 0) 70%)' },
  heroContent: { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroTitle: { fontSize: '3rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.5px' },
  heroSubtitle: { fontSize: '1.25rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '650px' },
  sectionContainer: { maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' },
  landingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' },
  landingSectionTitle: { fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' },
  landingText: { color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7' },
  placeholderTeamBox: { width: '100%', height: '240px', background: 'rgba(15, 35, 24, 0.5)', borderRadius: '16px', border: '2px dashed rgba(52, 211, 153, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  activitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  activityCard: { background: 'rgba(15, 30, 22, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' },
  contactCard: { background: 'rgba(15, 30, 22, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' },
  publicFooter: { padding: '2rem', textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(52, 211, 153, 0.1)', background: '#040805' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  loginCard: { background: '#0b1911', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2.2rem', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' },
  brandHeader: { marginBottom: '1.5rem', textAlign: 'center' },
  loginTitle: { fontSize: '1.6rem', fontWeight: '800', color: '#fff' },
  loginSubtitle: { fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.3rem' },
  formGap: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.5px' },
  input: { background: 'rgba(5, 15, 10, 0.7)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  primaryBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '0.85rem 1.2rem', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' },
  primaryBtnInline: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  secondaryBtnInline: { background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  linkBtn: { background: 'none', border: 'none', color: '#34d399', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' },
  errorBadge: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  successBadge: { background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  appLayout: { minHeight: '100vh', backgroundColor: '#060d08', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(9, 20, 14, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(52, 211, 153, 0.15)' },
  roleTag: { background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px' },
  navLinks: { display: 'flex', gap: '0.5rem', overflowX: 'auto' },
  tabBtn: { background: 'transparent', border: 'none', color: '#94a3b8', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' },
  activeTab: { background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
  logoutBtn: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' },
  mainContent: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' },
  glassCard: { background: 'rgba(15, 30, 22, 0.6)', border: '1px solid rgba(52, 211, 153, 0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  pinnedCard: { background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  highlightCard: { background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#fff' },
  cardDesc: { color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' },
  deleteBtn: { background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' },
  editBtn: { background: 'rgba(52, 211, 153, 0.15)', border: 'none', color: '#34d399', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' },
  emptyText: { color: '#64748b', fontStyle: 'italic', padding: '1rem 0' },
  gridGap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  pinTag: { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.9rem' },
  checkbox: { accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' },
  badge: { background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  timeTag: { background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.85rem' },
  td: { padding: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' }
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [landingData, setLandingData] = useState({
    title: 'Kornya Mentorstúdió',
    subtitle: 'Személyre szabott oktatás és tehetséggondozás',
    about_text: 'Stúdiónk célja, hogy segítse a diákokat a tanulási nehézségek leküzdésében és a kiemelkedő eredmények elérésében.',
    activities: 'Egyéni korrepetálás, Érettségi felkészítés, Versenyfelkészítés, Nyelvoktatás',
    phone: '+36 30 123 4567',
    email: 'info@mentorstudio.hu',
    address: 'Budapest, Fő utca 1.',
    team_image_url: null,
    logo_url: null
  });

  const [landingForm, setLandingForm] = useState({ ...landingData });
  const [teamImageFile, setTeamImageFile] = useState(null);
  const [logoImageFile, setLogoImageFile] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonData, setEditLessonData] = useState({ topic: '', notes: '', custom_price: 0 });

  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editTeacherData, setEditTeacherData] = useState({ full_name: '', email: '', phone: '', bio: '', subject: '', hourly_rate_50: 5000, hourly_rate_100: 9000, is_admin: false });

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({ full_name: '', email: '', school: '', class_name: '', notes: '' });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl || window.location.pathname.includes('/reset-password')) {
      if (tokenFromUrl) {
        setResetToken(tokenFromUrl);
        setShowLoginModal(true);
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState('news');

  const [announcements, setAnnouncements] = useState([]);
  const [aboutUsList, setAboutUsList] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pastLessons, setPastLessons] = useState([]);
  const [todayLesson, setTodayLesson] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [scheduleTeachers, setScheduleTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', is_pinned: false, is_applyable: false });
  
  const [aboutUsName, setAboutUsName] = useState('');
  const [aboutUsDesc, setAboutUsDesc] = useState('');
  const [aboutUsImage, setAboutUsImage] = useState(null);

  const [newStudent, setNewStudent] = useState({ full_name: '', email: '', password: '', school: '', class_name: '', notes: '' });
  const [newTeacher, setNewTeacher] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    phone: '', 
    bio: '', 
    subject: 'Matematika', 
    hourly_rate_50: 5000, 
    hourly_rate_100: 9000, 
    is_admin: false 
  });
  
  const [newLesson, setNewLesson] = useState({ 
    student_id: '', 
    subject: 'Matematika', 
    start_time: '', 
    end_time: '', 
    topic: '', 
    notes: '',
    custom_price: '',
    is_recurring: false,
    repeat_weeks: 4
  });
  
  const [subjectSearch, setSubjectSearch] = useState('');

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [logPeriodMode, setLogPeriodMode] = useState('week');
  const [logSelectedMonth, setLogSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [logSelectedWeek, setLogSelectedWeek] = useState('2026-W35');
  const [logData, setLogData] = useState(null);

  const [teacherEarningsPeriod, setTeacherEarningsPeriod] = useState('month');
  const [teacherEarningsMonth, setTeacherEarningsMonth] = useState(new Date().toISOString().slice(0, 7));
  const [teacherEarningsWeek, setTeacherEarningsWeek] = useState('2026-W35');

  const fetchLandingData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/landing`);
      const data = await res.json();
      if (data && !data.error) {
        setLandingData(data);
        setLandingForm(data);
      }
    } catch (err) {
      console.error('Hiba a landing adatok lekérésekor:', err);
    }
  }, []);

  useEffect(() => {
    fetchLandingData();
  }, [fetchLandingData]);

  const handleUpdateLanding = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', landingForm.title || '');
      formData.append('subtitle', landingForm.subtitle || '');
      formData.append('about_text', landingForm.about_text || '');
      formData.append('activities', landingForm.activities || '');
      formData.append('phone', landingForm.phone || '');
      formData.append('email', landingForm.email || '');
      formData.append('address', landingForm.address || '');

      if (teamImageFile) formData.append('team_image', teamImageFile);
      if (logoImageFile) formData.append('logo_image', logoImageFile);

      const res = await fetch(`${API_BASE}/landing`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a kezdőlap frissítésekor');

      alert('Kezdőlap sikeresen frissítve!');
      fetchLandingData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a bejelentkezésnél');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setShowLoginModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a jelszóvisszaállítás során');

      setSuccessMsg(data.message);
      setForgotEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: newResetPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a jelszó frissítésekor');

      setSuccessMsg(data.message);
      setResetToken('');
      setNewResetPassword('');
      window.history.replaceState({}, document.title, "/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setActiveTab('news');
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/announcements`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch { setAnnouncements([]); }
  }, [token]);

  const fetchAboutUs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/about-us`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAboutUsList(Array.isArray(data) ? data : []);
    } catch { setAboutUsList([]); }
  }, [token]);

  const fetchTeachers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch { setTeachers([]); }
  }, [token]);

  const fetchScheduleTeachers = useCallback(async () => {
    if (!token || (!user?.is_admin && user?.id !== 1)) return;
    try {
      const res = await fetch(`${API_BASE}/schedule/teachers`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setScheduleTeachers(Array.isArray(data) ? data : []);
    } catch { setScheduleTeachers([]); }
  }, [token, user]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/conversations`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : [];
      if (user?.role === 'student') {
        const filtered = rawList.filter(u => u.role === 'teacher' || Boolean(u.is_admin) || u.id === 1);
        setConversations(filtered);
      } else {
        setConversations(rawList);
      }
    } catch { setConversations([]); }
  }, [token, user]);

  const fetchMessages = useCallback(async (targetUserId) => {
    if (!token || !targetUserId) return;
    try {
      const res = await fetch(`${API_BASE}/messages/${targetUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { setMessages([]); }
  }, [token]);

  const fetchStudentData = useCallback(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    fetch(`${API_BASE}/student/today-lesson`, { headers }).then(r => r.json()).then(setTodayLesson).catch(() => {});
    fetch(`${API_BASE}/student/lessons`, { headers }).then(r => r.json()).then(data => setLessons(Array.isArray(data) ? data : [])).catch(() => {});
    fetch(`${API_BASE}/student/past-lessons`, { headers }).then(r => r.json()).then(data => setPastLessons(Array.isArray(data) ? data : [])).catch(() => {});
    fetch(`${API_BASE}/student/teacher-info`, { headers }).then(r => r.json()).then(setTeacherInfo).catch(() => {});
  }, [token]);

  const fetchTeacherData = useCallback(async () => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const endpoint = (user?.is_admin || user?.id === 1) && selectedTeacherId
      ? `${API_BASE}/teacher/all-lessons?teacher_id=${selectedTeacherId}`
      : `${API_BASE}/teacher/all-lessons`;

    try {
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      setLessons(Array.isArray(data) ? data : []);
    } catch { setLessons([]); }

    fetch(`${API_BASE}/teacher/students`, { headers })
      .then(r => r.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token, user, selectedTeacherId]);

  const fetchAdminLogData = useCallback(async () => {
    if (!token || (!user?.is_admin && user?.id !== 1)) return;
    try {
      let url = `${API_BASE}/admin/log?period_type=${logPeriodMode}`;
      if (logPeriodMode === 'month' && logSelectedMonth) {
        url += `&month=${logSelectedMonth}`;
      } else if (logPeriodMode === 'week' && logSelectedWeek) {
        url += `&week=${logSelectedWeek}`;
      }
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setLogData(data);
    } catch (err) {
      console.error('Hiba az admin log adatok lekérésekor:', err);
    }
  }, [token, user, logPeriodMode, logSelectedMonth, logSelectedWeek]);

  useEffect(() => {
    if (!token || !user) return;
    
    fetchAnnouncements();
    fetchAboutUs();
    fetchTeachers();
    fetchConversations();

    if (user.role === 'student') {
      fetchStudentData();
    } else if (user.role === 'teacher') {
      fetchTeacherData();
      if (user.is_admin || user.id === 1) {
        fetchScheduleTeachers();
      }
    }

    const interval = setInterval(() => {
      if (user.role === 'teacher') {
        fetchTeacherData();
      } else if (user.role === 'student') {
        fetchStudentData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, user, selectedTeacherId, fetchAnnouncements, fetchAboutUs, fetchTeachers, fetchConversations, fetchStudentData, fetchTeacherData, fetchScheduleTeachers]);

  useEffect(() => {
    if (activeTab === 'log') {
      fetchAdminLogData();
    }
  }, [activeTab, fetchAdminLogData, logPeriodMode, logSelectedMonth, logSelectedWeek]);

  useEffect(() => {
    if (token && (activeTab === 'teachers' || activeTab === 'searchTeachers')) {
      fetchTeachers();
    }
  }, [activeTab, token, fetchTeachers]);

  useEffect(() => {
    if (selectedUser && token) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, token, fetchMessages]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAnnouncement)
      });
      if (!res.ok) throw new Error('Hiba a hír létrehozásakor');
      setNewAnnouncement({ title: '', content: '', is_pinned: false, is_applyable: false });
      fetchAnnouncements();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a hírt?')) return;
    try {
      await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) { alert(err.message); }
  };

  const handleCreateAboutUs = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', aboutUsName);
      formData.append('description', aboutUsDesc);
      if (aboutUsImage) {
        formData.append('image', aboutUsImage);
      }

      const res = await fetch(`${API_BASE}/about-us`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) throw new Error('Hiba a névjegy létrehozásakor');
      
      setAboutUsName('');
      setAboutUsDesc('');
      setAboutUsImage(null);
      fetchAboutUs();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAboutUs = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a bemutatkozót?')) return;
    try {
      await fetch(`${API_BASE}/about-us/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAboutUs();
    } catch (err) { alert(err.message); }
  };

  const handleApplyToAnnouncement = async (announcement) => {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ announcement_id: announcement.id, teacher_id: announcement.teacher_id })
      });
      if (!res.ok) throw new Error('Hiba a jelentkezés elküldésekor');
      alert('Sikeresen jelentkeztél! Üzenet elküldve a tanárnak.');
      fetchConversations();
      setActiveTab('messages');
    } catch (err) { alert(err.message); }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/teacher/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newStudent)
      });
      if (!res.ok) throw new Error('Hiba a diák létrehozásakor');
      setNewStudent({ full_name: '', email: '', password: '', school: '', class_name: '', notes: '' });
      fetchTeacherData();
    } catch (err) { alert(err.message); }
  };

  const handleStartEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditStudentData({
      full_name: student.full_name || '',
      email: student.email || '',
      school: student.school || '',
      class_name: student.class_name || student.student_class || '',
      notes: student.notes || ''
    });
  };

  const handleSaveEditStudent = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/teacher/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editStudentData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a diák adatainak frissítésekor');
      setEditingStudentId(null);
      fetchTeacherData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a diákot?')) return;
    try {
      await fetch(`${API_BASE}/teacher/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTeacherData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/teacher/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newTeacher)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a tanár hozzáadásakor');
      setNewTeacher({ 
        full_name: '', 
        email: '', 
        password: '', 
        phone: '', 
        bio: '', 
        subject: 'Matematika', 
        hourly_rate_50: 5000, 
        hourly_rate_100: 9000, 
        is_admin: false 
      });
      alert('Tanár sikeresen hozzáadva!');
      fetchTeachers();
      fetchScheduleTeachers();
    } catch (err) { alert(err.message); }
  };

  const handleStartEditTeacher = (teacher) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherData({
      full_name: teacher.full_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      subject: teacher.subject || '',
      hourly_rate_50: teacher.hourly_rate_50 || 5000,
      hourly_rate_100: teacher.hourly_rate_100 || 9000,
      is_admin: Boolean(teacher.is_admin)
    });
  };

  const handleSaveEditTeacher = async (teacherId) => {
    try {
      const res = await fetch(`${API_BASE}/teacher/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editTeacherData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a tanár adatainak frissítésekor');
      setEditingTeacherId(null);
      fetchTeachers();
      fetchScheduleTeachers();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a tanárt?')) return;
    try {
      const res = await fetch(`${API_BASE}/teacher/teachers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a tanár törlésekor');
      fetchTeachers();
      fetchScheduleTeachers();
    } catch (err) { alert(err.message); }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const formattedStartTime = newLesson.start_time ? new Date(newLesson.start_time).toISOString() : '';
      const formattedEndTime = newLesson.end_time ? new Date(newLesson.end_time).toISOString() : '';

      const payload = {
        ...newLesson,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        custom_price: newLesson.custom_price ? parseFloat(newLesson.custom_price) : null
      };
      const res = await fetch(`${API_BASE}/teacher/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Hiba az óra létrehozásakor');
      setNewLesson({ student_id: '', subject: 'Matematika', start_time: '', end_time: '', topic: '', notes: '', custom_price: '', is_recurring: false, repeat_weeks: 4 });
      fetchTeacherData();
    } catch (err) { alert(err.message); }
  };

  const handleStartEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonData({
      topic: lesson.topic || '',
      notes: lesson.notes || '',
      custom_price: lesson.calculated_price || lesson.custom_price || 0
    });
  };

  const handleSaveEditLesson = async (lessonId) => {
    try {
      const res = await fetch(`${API_BASE}/teacher/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editLessonData)
      });
      if (!res.ok) throw new Error('Hiba a szerkesztés mentésekor');
      setEditingLessonId(null);
      if (user.role === 'teacher') fetchTeacherData(); else fetchStudentData();
      if (activeTab === 'log') fetchAdminLogData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Biztosan törölni / lemondani szeretnéd ezt az órát? A lemondásról e-mail értesítőt küldünk.')) return;
    try {
      const res = await fetch(`${API_BASE}/teacher/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Hiba az óra törlésekor');
      if (user.role === 'teacher') fetchTeacherData(); else fetchStudentData();
      if (activeTab === 'log') fetchAdminLogData();
    } catch (err) { alert(err.message); }
  };

  const handlePaymentChange = async (lessonId, newStatus) => {
    setLessons(prev => prev.map(l => 
      l.id === lessonId ? { ...l, payment_status: newStatus, is_paid: newStatus !== 'unpaid' } : l
    ));

    if (logData && logData.lessons) {
      setLogData(prev => ({
        ...prev,
        lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, payment_status: newStatus, is_paid: newStatus !== 'unpaid' } : l)
      }));
    }

    try {
      const res = await fetch(`${API_BASE}/teacher/lessons/${lessonId}/paid`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          payment_status: newStatus,
          is_paid: newStatus !== 'unpaid' 
        })
      });

      if (!res.ok) throw new Error('Nem sikerült a frissítés a szerveren');
      if (user.role === 'teacher') fetchTeacherData();
      if (activeTab === 'log') fetchAdminLogData();
    } catch (err) {
      console.error('Fizetési státusz mentési hiba:', err.message);
      if (user.role === 'teacher') fetchTeacherData();
      if (activeTab === 'log') fetchAdminLogData();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;
    
    if (user?.role === 'student' && selectedUser.role !== 'teacher' && !selectedUser.is_admin && selectedUser.id !== 1) {
      alert('Diákok kizárólag Tanár vagy Admin jogú felhasználóval léphetnek kapcsolatba!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('receiver_id', selectedUser.id);
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setNewMessage('');
        setSelectedFile(null);
        fetchMessages(selectedUser.id);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Hiba történt az üzenet küldésekor');
      }
    } catch (err) { alert(err.message || 'Hiba az üzenet küldése során!'); }
  };

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(t => 
    (t.subject && t.subject.toLowerCase().includes(subjectSearch.toLowerCase())) ||
    (t.full_name && t.full_name.toLowerCase().includes(subjectSearch.toLowerCase()))
  );

  const logoSrc = landingData.logo_url
    ? (landingData.logo_url.startsWith('http') ? landingData.logo_url : `${UPLOADS_BASE}${landingData.logo_url}`)
    : '/logofinal.png';

  const teamImageSrc = landingData.team_image_url
    ? (landingData.team_image_url.startsWith('http') ? landingData.team_image_url : `${UPLOADS_BASE}${landingData.team_image_url}`)
    : null;

  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const calculateTeacherEarnings = () => {
    if (!lessons || !Array.isArray(lessons)) {
      return { totalGross: 0, totalCommission: 0, netEarnings: 0, count50: 0, count100: 0, lessonList: [] };
    }

    const filteredLessons = lessons.filter(l => {
      if (!l.start_time) return false;
      const lDate = new Date(l.start_time);
      if (isNaN(lDate.getTime())) return false;

      if (teacherEarningsPeriod === 'month') {
        const monthStr = lDate.toISOString().slice(0, 7);
        return monthStr === teacherEarningsMonth;
      } else {
        const year = lDate.getFullYear();
        const weekNum = getISOWeek(lDate);
        const weekStr = `${year}-W${weekNum < 10 ? '0' + weekNum : weekNum}`;
        return weekStr === teacherEarningsWeek;
      }
    });

    let totalGross = 0;
    let totalCommission = 0;
    let count50 = 0;
    let count100 = 0;

    const lessonList = filteredLessons.map(l => {
      const start = new Date(l.start_time);
      const end = new Date(l.end_time);
      const durationMins = Math.round((end - start) / (1000 * 60));
      
      const price = l.calculated_price || l.custom_price || 0;
      let commission = 0;

      if (durationMins >= 80) {
        commission = 2000;
        count100++;
      } else {
        commission = 1500;
        count50++;
      }

      totalGross += price;
      totalCommission += commission;

      return {
        ...l,
        durationMins,
        price,
        commission,
        net: price - commission
      };
    });

    return {
      totalGross,
      totalCommission,
      netEarnings: totalGross - totalCommission,
      count50,
      count100,
      lessonList
    };
  };

  if (!token) {
    return (
      <div style={ui.landingPageContainer}>
        <style>{animations}</style>
        
        <header style={ui.publicHeader}>
          <div style={ui.navBrand}>
            <img src={logoSrc} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
            <span style={ui.brandText}>{landingData.title}</span>
          </div>
          <button 
            onClick={() => setShowLoginModal(true)} 
            style={ui.primaryBtnInline} 
            className="btn-hover"
          >
            <LogIn size={18}/> Bejelentkezés
          </button>
        </header>

        <section style={ui.heroSection}>
          <div style={ui.heroContent}>
            <img src={logoSrc} alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1rem' }} className="fade-in-up" />
            <h1 style={ui.heroTitle} className="fade-in-up">{landingData.title}</h1>
            <p style={ui.heroSubtitle} className="fade-in-up">{landingData.subtitle}</p>
            <button 
              onClick={() => setShowLoginModal(true)} 
              style={{ ...ui.primaryBtn, width: 'auto', padding: '0.9rem 2.2rem', fontSize: '1.1rem', marginTop: '1.5rem' }} 
              className="btn-hover fade-in-up"
            >
              Belépés az Oktatási Portálra <ChevronRight size={20}/>
            </button>
          </div>
        </section>

        <section style={ui.sectionContainer}>
          <div style={ui.landingGrid}>
            <div>
              <h2 style={ui.landingSectionTitle}>Rólunk</h2>
              <p style={ui.landingText}>{landingData.about_text}</p>
            </div>
            
            {teamImageSrc ? (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={teamImageSrc} 
                  alt="Csapatkép" 
                  style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', border: '2px solid rgba(52, 211, 153, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                />
              </div>
            ) : (
              <div style={ui.placeholderTeamBox}>
                <Users size={48} color="#34d399"/>
                <p style={{ marginTop: '0.5rem', color: '#a7f3d0' }}>Csapatkép hamarosan...</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ ...ui.sectionContainer, background: 'rgba(15, 35, 24, 0.4)' }}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2rem' }}>Tevékenységi Köreink</h2>
          <div style={ui.activitiesGrid}>
            {landingData.activities.split(',').map((act, idx) => (
              <div key={idx} style={ui.activityCard} className="card-hover">
                <Sparkles size={24} color="#34d399" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>{act.trim()}</h3>
              </div>
            ))}
          </div>
        </section>

        <section style={ui.sectionContainer}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2rem' }}>Kapcsolat & Elérhetőségek</h2>
          <div style={ui.contactGrid}>
            <div style={ui.contactCard}>
              <Phone size={24} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.5rem 0 0.2rem 0' }}>Telefon</h4>
              <p style={{ color: '#fff', fontWeight: '600' }}>{landingData.phone}</p>
            </div>

            <div style={ui.contactCard}>
              <Mail size={24} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.5rem 0 0.2rem 0' }}>E-mail</h4>
              <p style={{ color: '#fff', fontWeight: '600' }}>{landingData.email}</p>
            </div>

            <div style={ui.contactCard}>
              <MapPin size={24} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.5rem 0 0.2rem 0' }}>Címünk</h4>
              <p style={{ color: '#fff', fontWeight: '600' }}>{landingData.address}</p>
            </div>
          </div>
        </section>

        <footer style={ui.publicFooter}>
          <p>© {new Date().getFullYear()} {landingData.title}. Minden jog fenntartva.</p>
        </footer>

        {(showLoginModal || resetToken) && (
          <div style={ui.modalOverlay}>
            <div style={ui.loginCard} className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={logoSrc} alt="Logo" style={{ width: '32px', height: '32px' }} />
                  <span style={{ fontWeight: '700', color: '#fff' }}>{landingData.title}</span>
                </div>
                {!resetToken && (
                  <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                )}
              </div>

              <div style={ui.brandHeader}>
                <h2 style={ui.loginTitle}>
                  {resetToken
                    ? 'Új jelszó megadása'
                    : isForgotPasswordView
                    ? 'Új jelszó kérése'
                    : 'Bejelentkezés'}
                </h2>
                <p style={ui.loginSubtitle}>
                  {resetToken
                    ? 'Add meg az új jelszavadat'
                    : isForgotPasswordView
                    ? 'Adja meg a regisztrált e-mail címét'
                    : 'Lépj be az oktatási felületedre'}
                </p>
              </div>

              {error && <div style={ui.errorBadge}><AlertCircle size={16}/> {error}</div>}
              {successMsg && <div style={ui.successBadge}><CheckCircle2 size={16}/> {successMsg}</div>}

              {resetToken ? (
                <form onSubmit={handleResetPasswordSubmit} style={ui.formGap}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ÚJ JELSZÓ</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newResetPassword} 
                      onChange={e => setNewResetPassword(e.target.value)} 
                      required 
                      style={ui.input} 
                    />
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover">
                    Új jelszó mentése <KeyRound size={16} />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      setResetToken('');
                      setError('');
                      setSuccessMsg('');
                      window.history.replaceState({}, document.title, "/");
                    }} 
                    style={{ ...ui.tabBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                    className="btn-hover"
                  >
                    <ArrowLeft size={16} /> Vissza a bejelentkezéshez
                  </button>
                </form>
              ) : !isForgotPasswordView ? (
                <form onSubmit={handleLogin} style={ui.formGap}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input 
                      type="email" 
                      placeholder="tanar@oktatas.hu" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      style={ui.input} 
                    />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      style={ui.input} 
                    />
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '-0.3rem' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPasswordView(true);
                        setError('');
                        setSuccessMsg('');
                      }} 
                      style={ui.linkBtn}
                    >
                      Elfelejtetted a jelszavad?
                    </button>
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover">
                    Bejelentkezés <ChevronRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} style={ui.formGap}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input 
                      type="email" 
                      placeholder="regisztralt@email.hu" 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      required 
                      style={ui.input} 
                    />
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover">
                    Visszaállító link küldése <KeyRound size={16} />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      setIsForgotPasswordView(false);
                      setError('');
                      setSuccessMsg('');
                    }} 
                    style={{ ...ui.tabBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                    className="btn-hover"
                  >
                    <ArrowLeft size={16} /> Vissza a bejelentkezéshez
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const teacherEarningsData = calculateTeacherEarnings();

  return (
    <div style={ui.appLayout}>
      <style>{animations}</style>
      
      <header style={ui.navbar}>
        <div style={ui.navBrand}>
          <img src={logoSrc} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          <span style={ui.brandText}>{landingData.title}</span>
          <span style={ui.roleTag}>{(user?.is_admin || user?.id === 1) ? 'ADMIN' : (user?.role === 'teacher' ? 'TANÁR' : 'DIÁK')}</span>
        </div>

        <nav style={ui.navLinks}>
          <button onClick={() => setActiveTab('news')} style={activeTab === 'news' ? ui.activeTab : ui.tabBtn}>Hírfolyam</button>
          <button onClick={() => setActiveTab('about')} style={activeTab === 'about' ? ui.activeTab : ui.tabBtn}>Névjegy</button>
          
          {user?.role === 'student' ? (
            <>
              <button onClick={() => setActiveTab('events')} style={activeTab === 'events' ? ui.activeTab : ui.tabBtn}>Óráim</button>
              <button onClick={() => setActiveTab('searchTeachers')} style={activeTab === 'searchTeachers' ? ui.activeTab : ui.tabBtn}>Tanárkereső</button>
              <button onClick={() => setActiveTab('contact')} style={activeTab === 'contact' ? ui.activeTab : ui.tabBtn}>Tanárom</button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('calendar')} style={activeTab === 'calendar' ? ui.activeTab : ui.tabBtn}>Naptár</button>
              <button onClick={() => setActiveTab('students')} style={activeTab === 'students' ? ui.activeTab : ui.tabBtn}>Diákok</button>
              {!(user?.is_admin || user?.id === 1) && (
                <button onClick={() => setActiveTab('earnings')} style={activeTab === 'earnings' ? ui.activeTab : ui.tabBtn}>
                  <Calculator size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Kereset kimutatás
                </button>
              )}
              {(user?.is_admin || user?.id === 1) && (
                <>
                  <button onClick={() => setActiveTab('teachers')} style={activeTab === 'teachers' ? ui.activeTab : ui.tabBtn}>Tanárok</button>
                  <button onClick={() => setActiveTab('log')} style={activeTab === 'log' ? ui.activeTab : ui.tabBtn}>
                    <FileSpreadsheet size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Napló & Statisztika
                  </button>
                  <button onClick={() => setActiveTab('editLanding')} style={activeTab === 'editLanding' ? ui.activeTab : ui.tabBtn}>
                    <Layout size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Kezdőlap szerkesztése
                  </button>
                </>
              )}
            </>
          )}

          <button onClick={() => setActiveTab('messages')} style={activeTab === 'messages' ? ui.activeTab : ui.tabBtn}>
            <MessageSquare size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Üzenetek
          </button>

          <button onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? ui.activeTab : ui.tabBtn}>
            <User size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Profil
          </button>
        </nav>

        <button onClick={handleLogout} style={ui.logoutBtn} className="btn-hover">
          <LogOut size={16} /> Kilépés
        </button>
      </header>

      <main style={ui.mainContent} className="fade-in">

        {(user?.is_admin || user?.id === 1) && activeTab === 'editLanding' && (
          <div style={ui.glassCard} className="fade-in-up">
            <h3 style={ui.sectionTitle}><Layout size={20} color="#34d399"/> Bejelentkező Kezdőlap Szerkesztése</h3>
            <form onSubmit={handleUpdateLanding} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>FŐCÍM (TITLE)</label>
                  <input type="text" value={landingForm.title || ''} onChange={e => setLandingForm({...landingForm, title: e.target.value})} style={ui.input} required />
                </div>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>ALCÍM (SUBTITLE)</label>
                  <input type="text" value={landingForm.subtitle || ''} onChange={e => setLandingForm({...landingForm, subtitle: e.target.value})} style={ui.input} required />
                </div>
              </div>

              <div style={ui.inputGroup}>
                <label style={ui.label}>BEMUTATKOZÓ SZÖVEG (ABOUT TEXT)</label>
                <textarea value={landingForm.about_text || ''} onChange={e => setLandingForm({...landingForm, about_text: e.target.value})} style={{ ...ui.input, height: '100px' }} required></textarea>
              </div>

              <div style={ui.inputGroup}>
                <label style={ui.label}>TEVÉKENYSÉGI KÖRÖK (Vesszővel elválasztva)</label>
                <input type="text" value={landingForm.activities || ''} onChange={e => setLandingForm({...landingForm, activities: e.target.value})} style={ui.input} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>TELEFON</label>
                  <input type="text" value={landingForm.phone || ''} onChange={e => setLandingForm({...landingForm, phone: e.target.value})} style={ui.input} />
                </div>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>E-MAIL</label>
                  <input type="email" value={landingForm.email || ''} onChange={e => setLandingForm({...landingForm, email: e.target.value})} style={ui.input} />
                </div>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>CÍM</label>
                  <input type="text" value={landingForm.address || ''} onChange={e => setLandingForm({...landingForm, address: e.target.value})} style={ui.input} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>ÚJ LOGÓ KÉP</label>
                  <input type="file" accept="image/*" onChange={e => setLogoImageFile(e.target.files[0])} style={ui.input} />
                </div>
                <div style={ui.inputGroup}>
                  <label style={ui.label}>ÚJ CSAPATKÉP</label>
                  <input type="file" accept="image/*" onChange={e => setTeamImageFile(e.target.files[0])} style={ui.input} />
                </div>
              </div>

              <button type="submit" style={{ ...ui.primaryBtn, marginTop: '1rem' }} className="btn-hover">
                Kezdőlap Módosítások Mentése
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'news' && (
          <div>
            {user?.role === 'teacher' && (
              <div style={ui.glassCard} className="fade-in-up">
                <div style={ui.cardHeaderRow}>
                  <h3 style={ui.sectionTitle}><Megaphone size={18} color="#34d399"/> Új Hír Közzététele</h3>
                </div>
                <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>CÍM</label>
                    <input type="text" placeholder="Pl. Elmaradnak a pénteki órák" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TARTALOM</label>
                    <textarea placeholder="Leírás..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{...ui.input, height: '80px'}} required></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <label style={ui.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={newAnnouncement.is_pinned} 
                        onChange={e => setNewAnnouncement({...newAnnouncement, is_pinned: e.target.checked})} 
                        style={ui.checkbox}
                      /> 
                      <span>📌 Fixált Hír</span>
                    </label>

                    <label style={ui.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={newAnnouncement.is_applyable} 
                        onChange={e => setNewAnnouncement({...newAnnouncement, is_applyable: e.target.checked})} 
                        style={ui.checkbox}
                      /> 
                      <span>📝 Jelentkezhető óra</span>
                    </label>
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={18}/> Hír Közzététele</button>
                </form>
              </div>
            )}

            <h3 style={ui.sectionTitle}>Hirdetmények és Fontos Infók</h3>

            <div style={ui.gridGap}>
              {!Array.isArray(announcements) || announcements.length === 0 ? (
                <p style={ui.emptyText}>Jelenleg nincsenek aktív hírek.</p>
              ) : (
                announcements.map(a => (
                  <div key={a.id} style={a.is_pinned ? ui.pinnedCard : ui.glassCard} className="card-hover">
                    <div style={ui.cardHeaderRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {Boolean(a.is_pinned) && <span style={ui.pinTag}><Pin size={12}/> FIXÁLT HÍR</span>}
                        <h4 style={ui.cardTitle}>{a.title}</h4>
                      </div>
                      {user?.role === 'teacher' && (
                        <button onClick={() => handleDeleteAnnouncement(a.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                      )}
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>{a.content}</p>

                    {user?.role === 'student' && Boolean(a.is_applyable) && (
                      <button 
                        onClick={() => handleApplyToAnnouncement(a)} 
                        style={{ ...ui.primaryBtn, marginTop: '1rem', width: 'auto', padding: '0.6rem 1.2rem', background: '#10b981' }}
                        className="btn-hover"
                      >
                        <CheckCircle2 size={16}/> Jelentkezem az órára
                      </button>
                    )}

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Szerző: <strong>{a.teacher_name || 'Tanár'}</strong></span>
                      <span>{new Date(a.created_at).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            {user?.role === 'teacher' && (
              <div style={ui.glassCard} className="fade-in-up">
                <div style={ui.cardHeaderRow}>
                  <h3 style={ui.sectionTitle}><Users size={18} color="#34d399"/> Új Bemutatkozó Kártya Hozzáadása</h3>
                </div>
                <form onSubmit={handleCreateAboutUs} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>NÉV / CÍM</label>
                    <input 
                      type="text" 
                      placeholder="Pl. Dr. Nagy István - Matematika oktató" 
                      value={aboutUsName} 
                      onChange={e => setAboutUsName(e.target.value)} 
                      style={ui.input} 
                      required 
                    />
                  </div>
                  
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ARCKÉP KÉPFÁJL</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setAboutUsImage(e.target.files[0])} 
                      style={ui.input} 
                      required 
                    />
                  </div>

                  <div style={ui.inputGroup}>
                    <label style={ui.label}>BEMUTATKOZÓ SZÖVEG</label>
                    <textarea 
                      placeholder="Leírás, tapasztalatok, specializáció..." 
                      value={aboutUsDesc} 
                      onChange={e => setAboutUsDesc(e.target.value)} 
                      style={{...ui.input, height: '100px'}} 
                      required
                    ></textarea>
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={18}/> Kártya Hozzáadása</button>
                </form>
              </div>
            )}

            <h3 style={ui.sectionTitle}>Akik Mögöttünk Állnak - Névjegy</h3>

            <div style={ui.gridGap}>
              {!Array.isArray(aboutUsList) || aboutUsList.length === 0 ? (
                <p style={ui.emptyText}>Még nem töltöttek fel bemutatkozást.</p>
              ) : (
                aboutUsList.map(item => {
                  const imageUrl = item.image_url
                    ? (item.image_url.startsWith('http') ? item.image_url : `${UPLOADS_BASE}${item.image_url}`)
                    : 'https://via.placeholder.com/120';

                  return (
                    <div key={item.id} style={ui.glassCard} className="card-hover">
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <img 
                          src={imageUrl} 
                          alt={item.name} 
                          style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(52, 211, 153, 0.4)' }} 
                        />
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={ui.cardHeaderRow}>
                            <h4 style={ui.cardTitle}>{item.name}</h4>
                            {user?.role === 'teacher' && (
                              <button onClick={() => handleDeleteAboutUs(item.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                            )}
                          </div>
                          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {user?.role === 'student' && activeTab === 'events' && (
          <div>
            {todayLesson ? (
              <div style={ui.highlightCard} className="fade-in-up">
                <div style={ui.cardHeaderRow}>
                  <span style={ui.badge}><Sparkles size={14}/> MAI ÓRÁD</span>
                  <span style={ui.timeTag}>
                    {new Date(todayLesson.start_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0.5rem 0' }}>{todayLesson.subject}</h3>
                <p style={ui.cardDesc}><BookOpen size={16}/> {todayLesson.topic || 'Tematika nincs megadva'}</p>
                {todayLesson.notes && <p style={{ ...ui.cardDesc, color: '#94a3b8' }}><FileText size={16}/> Megjegyzés: {todayLesson.notes}</p>}
                <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Óradíj: {(todayLesson.calculated_price || 0).toLocaleString('hu-HU')} Ft</p>
              </div>
            ) : (
              <div style={ui.glassCard}>
                <p style={ui.emptyText}>Mai napon nincs kiírt órád.</p>
              </div>
            )}

            <h3 style={{ ...ui.sectionTitle, marginTop: '2rem' }}>Közelgő Óráim</h3>
            <div style={ui.gridGap}>
              {lessons.length === 0 ? (
                <p style={ui.emptyText}>Nincsenek jövőbeli óráid.</p>
              ) : (
                lessons.map(l => (
                  <div key={l.id} style={ui.glassCard} className="card-hover">
                    <div style={ui.cardHeaderRow}>
                      <h4 style={ui.cardTitle}>{l.subject}</h4>
                      <span style={ui.timeTag}>{formatLessonTime(l.start_time, l.end_time)}</span>
                    </div>
                    <p style={ui.cardDesc}><BookOpen size={16}/> {l.topic || 'Tematika nincs megadva'}</p>
                    {l.notes && <p style={{ ...ui.cardDesc, color: '#94a3b8' }}><FileText size={16}/> Megjegyzés: {l.notes}</p>}
                    <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Díj: {(l.calculated_price || 0).toLocaleString('hu-HU')} Ft</p>
                  </div>
                ))
              )}
            </div>

            <h3 style={{ ...ui.sectionTitle, marginTop: '2rem' }}>Korábbi Óráim</h3>
            <div style={ui.gridGap}>
              {pastLessons.length === 0 ? (
                <p style={ui.emptyText}>Nincsenek korábbi óráid.</p>
              ) : (
                pastLessons.map(l => (
                  <div key={l.id} style={{ ...ui.glassCard, opacity: 0.7 }} className="card-hover">
                    <div style={ui.cardHeaderRow}>
                      <h4 style={ui.cardTitle}>{l.subject}</h4>
                      <span style={ui.timeTag}>{formatLessonTime(l.start_time, l.end_time)}</span>
                    </div>
                    <p style={ui.cardDesc}><BookOpen size={16}/> {l.topic || 'Tematika nincs megadva'}</p>
                    <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Díj: {(l.calculated_price || 0).toLocaleString('hu-HU')} Ft</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === 'student' && activeTab === 'searchTeachers' && (
          <div>
            <h3 style={ui.sectionTitle}><Search size={20} color="#34d399"/> Tanárkereső & Szaktanárok</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Keresés tantárgy vagy tanár neve alapján..." 
                value={subjectSearch} 
                onChange={e => setSubjectSearch(e.target.value)} 
                style={ui.input} 
              />
            </div>

            <div style={ui.gridGap}>
              {filteredTeachers.length === 0 ? (
                <p style={ui.emptyText}>Nem található tanár a keresési feltételeknek megfelelően.</p>
              ) : (
                filteredTeachers.map(t => (
                  <div key={t.id} style={ui.glassCard} className="card-hover">
                    <div style={ui.cardHeaderRow}>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{t.full_name}</h4>
                        <span style={{ ...ui.badge, marginTop: '0.3rem' }}><BookOpen size={12}/> {t.subject || 'Szakos tanár'}</span>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#34d399' }}>
                          <span>50 perc: {t.hourly_rate_50 || 5000} Ft</span> | <span>100 perc: {t.hourly_rate_100 || 9000} Ft</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedUser(t);
                          setActiveTab('messages');
                        }} 
                        style={ui.primaryBtnInline} 
                        className="btn-hover"
                      >
                        <MessageSquare size={16}/> Üzenet küldése
                      </button>
                    </div>
                    
                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.8rem', lineHeight: '1.5' }}>
                      {t.bio || 'Nincs részletes bemutatkozás megadva.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                      {t.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14}/> {t.phone}</span>}
                      {t.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {t.email}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === 'student' && activeTab === 'contact' && (
          <div>
            <h3 style={ui.sectionTitle}>Személyes Tanárod Elérhetőségei</h3>
            {teacherInfo ? (
              <div style={ui.glassCard} className="fade-in-up">
                <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>{teacherInfo.full_name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Mail size={18} color="#34d399"/> <strong>E-mail:</strong> {teacherInfo.email}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Phone size={18} color="#34d399"/> <strong>Telefon:</strong> {teacherInfo.phone || 'Nincs megadva'}</p>
                  {teacherInfo.bio && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
                      <strong style={{ color: '#34d399' }}>Bemutatkozás:</strong>
                      <p style={{ color: '#94a3b8', marginTop: '0.3rem', lineHeight: '1.5' }}>{teacherInfo.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={ui.glassCard}>
                <p style={ui.emptyText}>Még nincs rendelve hozzá tanár az óráid alapján.</p>
              </div>
            )}
          </div>
        )}

        {user?.role === 'teacher' && activeTab === 'calendar' && (
          <div>
            {(user?.is_admin || user?.id === 1) && (
              <div style={ui.glassCard} className="fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>TANÁRI SZŰRŐ (ADMIN):</label>
                  <select 
                    value={selectedTeacherId} 
                    onChange={e => setSelectedTeacherId(e.target.value)} 
                    style={{ ...ui.input, minWidth: '220px' }}
                  >
                    <option value="">Összes tanár órái</option>
                    {scheduleTeachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={ui.glassCard} className="fade-in-up">
              <h3 style={ui.sectionTitle}><CalendarIcon size={20} color="#34d399"/> Órarendi Naptár Nézet</h3>
              <ScheduleView lessons={lessons} user={user} token={token} selectedTeacherId={selectedTeacherId} onDeleteLesson={handleDeleteLesson} />
            </div>

            <div style={ui.glassCard} className="fade-in-up">
              <h3 style={ui.sectionTitle}><Plus size={20} color="#34d399"/> Új Óra Kiírása</h3>
              <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>DIÁK KIVÁLASZTÁSA</label>
                    <select 
                      value={newLesson.student_id} 
                      onChange={e => setNewLesson({...newLesson, student_id: e.target.value})} 
                      style={ui.input} 
                      required
                    >
                      <option value="">-- Válassz diákot --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                      ))}
                    </select>
                  </div>

                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TANTÁRGY</label>
                    <input 
                      type="text" 
                      value={newLesson.subject} 
                      onChange={e => setNewLesson({...newLesson, subject: e.target.value})} 
                      style={ui.input} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>KEZDETI IDŐPONT</label>
                    <input 
                      type="datetime-local" 
                      value={newLesson.start_time} 
                      onChange={e => setNewLesson({...newLesson, start_time: e.target.value})} 
                      style={ui.input} 
                      required 
                    />
                  </div>

                  <div style={ui.inputGroup}>
                    <label style={ui.label}>BEFEJEZŐ IDŐPONT</label>
                    <input 
                      type="datetime-local" 
                      value={newLesson.end_time} 
                      onChange={e => setNewLesson({...newLesson, end_time: e.target.value})} 
                      style={ui.input} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TÉMAKÖR / TEMATIKA</label>
                    <input 
                      type="text" 
                      placeholder="Pl. Másodfokú egyenletek" 
                      value={newLesson.topic} 
                      onChange={e => setNewLesson({...newLesson, topic: e.target.value})} 
                      style={ui.input} 
                    />
                  </div>

                  <div style={ui.inputGroup}>
                    <label style={ui.label}>EGYEDI ÓRADÍJ (FT) - Opcionális</label>
                    <input 
                      type="number" 
                      placeholder="Üresen hagyva az egyéni alapérték töltődik" 
                      value={newLesson.custom_price} 
                      onChange={e => setNewLesson({...newLesson, custom_price: e.target.value})} 
                      style={ui.input} 
                    />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>MEGJEGYZÉS</label>
                  <textarea 
                    placeholder="Házifeladat, egyéni megjegyzések..." 
                    value={newLesson.notes} 
                    onChange={e => setNewLesson({...newLesson, notes: e.target.value})} 
                    style={{ ...ui.input, height: '70px' }}
                  ></textarea>
                </div>

                <div style={{ background: 'rgba(5, 15, 10, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)', marginTop: '0.5rem' }}>
                  <label style={ui.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={newLesson.is_recurring} 
                      onChange={e => setNewLesson({...newLesson, is_recurring: e.target.checked})} 
                      style={ui.checkbox} 
                    />
                    <span style={{ fontWeight: '700', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Repeat size={16} /> Ismétlődő óra generálása (Hetente ugyanebben az időpontban)
                    </span>
                  </label>

                  {newLesson.is_recurring && (
                    <div style={{ ...ui.inputGroup, marginTop: '0.8rem' }}>
                      <label style={ui.label}>ISMÉTLŐDÉSEK SZÁMA (HETEK SZÁMA)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="52" 
                        value={newLesson.repeat_weeks} 
                        onChange={e => setNewLesson({...newLesson, repeat_weeks: parseInt(e.target.value) || 1})} 
                        style={{ ...ui.input, maxWidth: '200px' }} 
                        required 
                      />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        A megadott kezdési időponttól kezdve heti rendszerességgel jönnek létre az alkalmak.
                      </span>
                    </div>
                  )}
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={18}/> Óra Kiírása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Órák Listája & Szerkesztése & Fizetés</h3>
            <div style={ui.gridGap}>
              {lessons.length === 0 ? (
                <p style={ui.emptyText}>Még nincsenek kiírt órák.</p>
              ) : (
                lessons.map(l => (
                  <div key={l.id} style={ui.glassCard} className="card-hover">
                    {editingLessonId === l.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: '#34d399', margin: 0 }}>Óra Szerkesztése (#{l.id})</h4>
                        
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>TÉMAKÖR</label>
                          <input 
                            type="text" 
                            value={editLessonData.topic} 
                            onChange={e => setEditLessonData({ ...editLessonData, topic: e.target.value })} 
                            style={ui.input} 
                          />
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>MEGJEGYZÉS</label>
                          <textarea 
                            value={editLessonData.notes} 
                            onChange={e => setEditLessonData({ ...editLessonData, notes: e.target.value })} 
                            style={{ ...ui.input, height: '60px' }} 
                          />
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>ÓRADÍJ (FT)</label>
                          <input 
                            type="number" 
                            value={editLessonData.custom_price} 
                            onChange={e => setEditLessonData({ ...editLessonData, custom_price: parseFloat(e.target.value) || 0 })} 
                            style={ui.input} 
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleSaveEditLesson(l.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                          <button onClick={() => setEditingLessonId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={ui.cardHeaderRow}>
                          <div>
                            <h4 style={ui.cardTitle}>{l.subject} - {l.student_name || 'Diák'}</h4>
                            <span style={ui.timeTag}>{formatLessonTime(l.start_time, l.end_time)}</span>
                          </div>
                          <div>
                            <button onClick={() => handleStartEditLesson(l)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteLesson(l.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                          </div>
                        </div>

                        <p style={ui.cardDesc}><BookOpen size={16}/> {l.topic || 'Nincs leírás'}</p>
                        {l.notes && <p style={{ ...ui.cardDesc, color: '#94a3b8' }}><FileText size={16}/> Megjegyzés: {l.notes}</p>}
                        
                        <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                          Beállított díj: {(l.calculated_price || 0).toLocaleString('hu-HU')} Ft
                        </p>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: '700' }}>Fizetési Státusz:</span>
                          <select 
                            value={l.payment_status || (l.is_paid ? 'cash' : 'unpaid')} 
                            onChange={e => handlePaymentChange(l.id, e.target.value)}
                            style={{
                              ...ui.input,
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.85rem',
                              background: l.payment_status === 'settled' ? 'rgba(59, 130, 246, 0.2)' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                              borderColor: l.payment_status === 'settled' ? '#3b82f6' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? '#10b981' : '#ef4444'),
                              color: '#fff'
                            }}
                          >
                            <option value="unpaid" style={{ background: '#0f2318' }}>❌ Kifizetetlen</option>
                            <option value="cash" style={{ background: '#0f2318' }}>💵 Készpénz</option>
                            <option value="transfer" style={{ background: '#0f2318' }}>🏦 Átutalás</option>
                            <option value="settled" style={{ background: '#0f2318' }}>🤝 Rendezve (Jutalék mentes)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === 'teacher' && !(user?.is_admin || user?.id === 1) && activeTab === 'earnings' && (
          <div style={ui.glassCard} className="fade-in-up">
            <h3 style={ui.sectionTitle}>
              <Calculator size={22} color="#34d399"/> Óradíj & Kereset Kimutatás
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Az alábbiakban láthatod a beállított óradíjaid alapján befolyt bruttó összeget, a rendszerhasználati díjat (kornya.kms@gmail.com számára: 50 perces óránként 1.500 Ft, 100 perces óránként 2.000 Ft), valamint a levonás utáni **végleges nettó keresetedet**.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem', background: 'rgba(5, 15, 10, 0.5)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <div style={ui.inputGroup}>
                <label style={ui.label}>BONTÁSI IDŐSZAK</label>
                <select value={teacherEarningsPeriod} onChange={e => setTeacherEarningsPeriod(e.target.value)} style={ui.input}>
                  <option value="week">Heti bontás</option>
                  <option value="month">Havi bontás</option>
                </select>
              </div>

              {teacherEarningsPeriod === 'month' ? (
                <div style={ui.inputGroup}>
                  <label style={ui.label}>HÓNAP KIVÁLASZTÁSA (YYYY-MM)</label>
                  <input type="month" value={teacherEarningsMonth} onChange={e => setTeacherEarningsMonth(e.target.value)} style={ui.input} />
                </div>
              ) : (
                <div style={ui.inputGroup}>
                  <label style={ui.label}>HÉT KIVÁLASZTÁSA (YYYY-Www)</label>
                  <input type="week" value={teacherEarningsWeek} onChange={e => setTeacherEarningsWeek(e.target.value)} style={ui.input} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)', padding: '1.3rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.5px' }}>BEFOLYT BRUTTÓ ÖSSZEG</span>
                  <DollarSign size={20} color="#60a5fa"/>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0 0.2rem 0' }}>
                  {teacherEarningsData.totalGross.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Diákok által fizetett összeg</span>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)', padding: '1.3rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f87171', letterSpacing: '0.5px' }}>LEVONT JUTALÉK (KORNYA.KMS)</span>
                  <TrendingUp size={20} color="#f87171"/>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0 0.2rem 0' }}>
                  -{teacherEarningsData.totalCommission.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>50p: {teacherEarningsData.count50}x1500 Ft | 100p: {teacherEarningsData.count100}x2000 Ft</span>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)', padding: '1.3rem', borderRadius: '16px', border: '2px solid rgba(52, 211, 153, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.5px' }}>VÉGLEGES NETTÓ KERESET</span>
                  <CheckCircle2 size={20} color="#34d399"/>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#34d399', margin: '0.5rem 0 0.2rem 0' }}>
                  {teacherEarningsData.netEarnings.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Kézhez kapandó tiszta összeg</span>
              </div>
            </div>

            <h4 style={{ ...ui.cardTitle, color: '#34d399', marginBottom: '0.8rem' }}>Időszakban megtartott óráid és bontásuk</h4>
            {teacherEarningsData.lessonList.length === 0 ? (
              <p style={ui.emptyText}>Ebben az időszakban nem volt rögzített órád.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={ui.table}>
                  <thead>
                    <tr>
                      <th style={ui.th}>Időpont</th>
                      <th style={ui.th}>Diák</th>
                      <th style={ui.th}>Tantárgy</th>
                      <th style={ui.th}>Időtartam</th>
                      <th style={ui.th}>Óradíj (Bruttó)</th>
                      <th style={ui.th}>Jutalék (KORNYA.KMS)</th>
                      <th style={ui.th}>Saját Nettó</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherEarningsData.lessonList.map(l => (
                      <tr key={l.id}>
                        <td style={ui.td}>{formatLessonTime(l.start_time, l.end_time)}</td>
                        <td style={ui.td}>{l.student_name || 'Diák'}</td>
                        <td style={ui.td}><strong>{l.subject}</strong></td>
                        <td style={ui.td}>{l.durationMins} perc</td>
                        <td style={{ ...ui.td, color: '#60a5fa' }}>{l.price.toLocaleString('hu-HU')} Ft</td>
                        <td style={{ ...ui.td, color: '#f87171' }}>-{l.commission.toLocaleString('hu-HU')} Ft</td>
                        <td style={{ ...ui.td, color: '#34d399', fontWeight: '700' }}>{l.net.toLocaleString('hu-HU')} Ft</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {user?.role === 'teacher' && activeTab === 'students' && (
          <div>
            <div style={ui.glassCard} className="fade-in-up">
              <h3 style={ui.sectionTitle}><UserPlus size={20} color="#34d399"/> Új Diák Regisztrálása</h3>
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" placeholder="Kovács Péter" value={newStudent.full_name} onChange={e => setNewStudent({...newStudent, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" placeholder="diak@email.hu" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" placeholder="••••••••" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ISKOLA</label>
                    <input type="text" placeholder="Pl. Petőfi Sándor Gimnázium" value={newStudent.school} onChange={e => setNewStudent({...newStudent, school: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>OSZTÁLY</label>
                    <input type="text" placeholder="Pl. 10.B" value={newStudent.class_name} onChange={e => setNewStudent({...newStudent, class_name: e.target.value})} style={ui.input} />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>MEGJEGYZÉS A DIÁKHOZ (OPCIONÁLIS)</label>
                  <textarea 
                    placeholder="Egyéni megjegyzés, szint, vállalt alkalmak stb." 
                    value={newStudent.notes} 
                    onChange={e => setNewStudent({...newStudent, notes: e.target.value})} 
                    style={{ ...ui.input, height: '60px' }} 
                  />
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><UserPlus size={18}/> Diák Regisztrálása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Regisztrált Diákok</h3>
            <div style={ui.gridGap}>
              {students.length === 0 ? (
                <p style={ui.emptyText}>Még nincsenek felvett diákok.</p>
              ) : (
                students.map(s => (
                  <div key={s.id} style={ui.glassCard} className="card-hover">
                    {editingStudentId === s.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: '#34d399', margin: 0 }}>Diák Adatainak Szerkesztése (#{s.id})</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>TELJES NÉV</label>
                            <input 
                              type="text" 
                              value={editStudentData.full_name} 
                              onChange={e => setEditStudentData({ ...editStudentData, full_name: e.target.value })} 
                              style={ui.input} 
                              required 
                            />
                          </div>

                          <div style={ui.inputGroup}>
                            <label style={ui.label}>E-MAIL CÍM</label>
                            <input 
                              type="email" 
                              value={editStudentData.email} 
                              onChange={e => setEditStudentData({ ...editStudentData, email: e.target.value })} 
                              style={ui.input} 
                              required 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>ISKOLA</label>
                            <input 
                              type="text" 
                              value={editStudentData.school} 
                              onChange={e => setEditStudentData({ ...editStudentData, school: e.target.value })} 
                              style={ui.input} 
                            />
                          </div>

                          <div style={ui.inputGroup}>
                            <label style={ui.label}>OSZTÁLY</label>
                            <input 
                              type="text" 
                              value={editStudentData.class_name} 
                              onChange={e => setEditStudentData({ ...editStudentData, class_name: e.target.value })} 
                              style={ui.input} 
                            />
                          </div>
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>MEGJEGYZÉS</label>
                          <textarea 
                            value={editStudentData.notes} 
                            onChange={e => setEditStudentData({ ...editStudentData, notes: e.target.value })} 
                            style={{ ...ui.input, height: '60px' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleSaveEditStudent(s.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                          <button onClick={() => setEditingStudentId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <div style={ui.cardHeaderRow}>
                        <div>
                          <h4 style={ui.cardTitle}>{s.full_name}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.email}</p>
                          {(s.school || s.class_name || s.student_class) && (
                            <p style={{ ...ui.cardDesc, color: '#34d399', marginTop: '0.3rem' }}>
                              <School size={14} /> {s.school || 'Iskola N/A'} {(s.class_name || s.student_class) ? `(${s.class_name || s.student_class})` : ''}
                            </p>
                          )}
                          {s.notes && (
                            <p style={{ ...ui.cardDesc, color: '#a7f3d0', marginTop: '0.4rem' }}>
                              <FileText size={14} /> Megjegyzés: {s.notes}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={ui.badge}>{s.total_lessons || 0} óra felvéve</span>
                          <button onClick={() => handleStartEditStudent(s)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteStudent(s.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(user?.is_admin || user?.id === 1) && activeTab === 'teachers' && (
          <div>
            <div style={ui.glassCard} className="fade-in-up">
              <h3 style={ui.sectionTitle}><ShieldCheck size={20} color="#34d399"/> Új Tanár Hozzáadása (Adminisztrátor)</h3>
              <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" placeholder="Dr. Minta János" value={newTeacher.full_name} onChange={e => setNewTeacher({...newTeacher, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" placeholder="tanar@mentorstudio.hu" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" placeholder="••••••••" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELEFONSZÁM</label>
                    <input type="text" placeholder="+36 30 000 0000" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>FŐ TANTÁRGY / SZAK</label>
                    <input type="text" placeholder="Matematika, Fizika" value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ÓRADÍJ - 50 PERC (FT)</label>
                    <input type="number" step="500" placeholder="5000" value={newTeacher.hourly_rate_50} onChange={e => setNewTeacher({...newTeacher, hourly_rate_50: parseInt(e.target.value) || 0})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ÓRADÍJ - 100 PERC (FT)</label>
                    <input type="number" step="500" placeholder="9000" value={newTeacher.hourly_rate_100} onChange={e => setNewTeacher({...newTeacher, hourly_rate_100: parseInt(e.target.value) || 0})} style={ui.input} required />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>BEMUTATKOZÓ BIO</label>
                  <textarea placeholder="Rövid leírás a tanárról a tanárkeresőhöz..." value={newTeacher.bio} onChange={e => setNewTeacher({...newTeacher, bio: e.target.value})} style={{ ...ui.input, height: '70px' }}></textarea>
                </div>

                <label style={ui.checkboxLabel}>
                  <input type="checkbox" checked={newTeacher.is_admin} onChange={e => setNewTeacher({ ...newTeacher, is_admin: e.target.checked })} style={ui.checkbox} />
                  <span>🛡 Adminisztrátori jogosultság megadása</span>
                </label>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><UserPlus size={18}/> Tanár Regisztrálása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Regisztrált Tanárok Rendszerben</h3>
            <div style={ui.gridGap}>
              {teachers.length === 0 ? (
                <p style={ui.emptyText}>Még nincsenek felvett tanárok.</p>
              ) : (
                teachers.map(t => (
                  <div key={t.id} style={ui.glassCard} className="card-hover">
                    {editingTeacherId === t.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: '#34d399', margin: 0 }}>Tanár Adatainak Szerkesztése (#{t.id})</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>TELJES NÉV</label>
                            <input type="text" value={editTeacherData.full_name} onChange={e => setEditTeacherData({ ...editTeacherData, full_name: e.target.value })} style={ui.input} required />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>E-MAIL CÍM</label>
                            <input type="email" value={editTeacherData.email} onChange={e => setEditTeacherData({ ...editTeacherData, email: e.target.value })} style={ui.input} required />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>TELEFON</label>
                            <input type="text" value={editTeacherData.phone} onChange={e => setEditTeacherData({ ...editTeacherData, phone: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>ÓRADÍJ (50P)</label>
                            <input type="number" value={editTeacherData.hourly_rate_50} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_50: parseInt(e.target.value) || 0 })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>ÓRADÍJ (100P)</label>
                            <input type="number" value={editTeacherData.hourly_rate_100} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_100: parseInt(e.target.value) || 0 })} style={ui.input} />
                          </div>
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>SZAK / TANTÁRGY</label>
                          <input type="text" value={editTeacherData.subject} onChange={e => setEditTeacherData({ ...editTeacherData, subject: e.target.value })} style={ui.input} />
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>BEMUTATKOZÓ BIO</label>
                          <textarea value={editTeacherData.bio} onChange={e => setEditTeacherData({ ...editTeacherData, bio: e.target.value })} style={{ ...ui.input, height: '60px' }} />
                        </div>

                        <label style={ui.checkboxLabel}>
                          <input type="checkbox" checked={editTeacherData.is_admin} onChange={e => setEditTeacherData({ ...editTeacherData, is_admin: e.target.checked })} style={ui.checkbox} />
                          <span>🛡 Adminisztrátori jogok</span>
                        </label>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleSaveEditTeacher(t.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                          <button onClick={() => setEditingTeacherId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <div style={ui.cardHeaderRow}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={ui.cardTitle}>{t.full_name}</h4>
                            {Boolean(t.is_admin) && <span style={ui.roleTag}>ADMIN</span>}
                          </div>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t.email} | {t.phone || 'Nincs telefon'}</p>
                          <p style={{ ...ui.cardDesc, color: '#34d399', marginTop: '0.3rem' }}>
                            <BookOpen size={14} /> Szak: {t.subject || 'Szakos tanár'} | 50p: {t.hourly_rate_50 || 5000} Ft, 100p: {t.hourly_rate_100 || 9000} Ft
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => handleStartEditTeacher(t)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteTeacher(t.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(user?.is_admin || user?.id === 1) && activeTab === 'log' && (
          <div>
            <div style={ui.glassCard} className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={ui.sectionTitle}><FileSpreadsheet size={22} color="#34d399"/> Pénzügyi Napló & Rendszer Statisztika</h3>
                <button onClick={() => window.print()} style={ui.secondaryBtnInline} className="btn-hover no-print">
                  <Printer size={16}/> Nyomtatás / PDF Exportálás
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }} className="no-print">
                <div style={ui.inputGroup}>
                  <label style={ui.label}>IDŐSZAK SZŰRŐ</label>
                  <select value={logPeriodMode} onChange={e => setLogPeriodMode(e.target.value)} style={ui.input}>
                    <option value="week">Heti bontás</option>
                    <option value="month">Havi bontás</option>
                  </select>
                </div>

                {logPeriodMode === 'month' ? (
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>HÓNAP</label>
                    <input type="month" value={logSelectedMonth} onChange={e => setLogSelectedMonth(e.target.value)} style={ui.input} />
                  </div>
                ) : (
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>HÉT</label>
                    <input type="week" value={logSelectedWeek} onChange={e => setLogSelectedWeek(e.target.value)} style={ui.input} />
                  </div>
                )}
              </div>

              {logData && (
                <div id="printable-log-section">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399' }}>ÖSSZES ÓRA</span>
                      <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.3rem 0 0 0' }}>{logData.summary?.total_lessons_count || 0} db</h3>
                    </div>
                    
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa' }}>ADMIN SAJÁT KANÁR BEVÉTEL</span>
                      <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.3rem 0 0 0' }}>{(logData.summary?.admin_direct_revenue || 0).toLocaleString('hu-HU')} Ft</h3>
                    </div>

                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#facc15' }}>NEM ADMIN TANÁROK UTÁNI BEFOLYT JUTALÉK</span>
                      <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.3rem 0 0 0' }}>{(logData.summary?.non_admin_commission_revenue || 0).toLocaleString('hu-HU')} Ft</h3>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>kornya.kms@gmail.com részesedés</span>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '2px solid rgba(52, 211, 153, 0.5)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399' }}>TELJES SAJÁT KERESET (ADMIN)</span>
                      <h3 style={{ fontSize: '1.8rem', color: '#34d399', margin: '0.3rem 0 0 0', fontWeight: '900' }}>
                        {((logData.summary?.admin_direct_revenue || 0) + (logData.summary?.non_admin_commission_revenue || 0)).toLocaleString('hu-HU')} Ft
                      </h3>
                    </div>
                  </div>

                  <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Részletes Óralapok és Fizetési Állapot</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={ui.table}>
                      <thead>
                        <tr>
                          <th style={ui.th}>Tanár</th>
                          <th style={ui.th}>Diák</th>
                          <th style={ui.th}>Időpont</th>
                          <th style={ui.th}>Tantárgy</th>
                          <th style={ui.th}>Bruttó Díj</th>
                          <th style={ui.th}>Admin Részesedés (kornya.kms)</th>
                          <th style={ui.th}>Státusz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!logData.lessons || logData.lessons.length === 0) ? (
                          <tr><td colSpan="7" style={{ ...ui.td, textAlign: 'center', color: '#64748b' }}>Nincs megjeleníthető adat az időszakban.</td></tr>
                        ) : (
                          logData.lessons.map(l => (
                            <tr key={l.id}>
                              <td style={ui.td}><strong>{l.teacher_name}</strong> {Boolean(l.is_teacher_admin) && '(Admin)'}</td>
                              <td style={ui.td}>{l.student_name}</td>
                              <td style={ui.td}>{formatLessonTime(l.start_time, l.end_time)}</td>
                              <td style={ui.td}>{l.subject}</td>
                              <td style={ui.td}>{(l.calculated_price || 0).toLocaleString('hu-HU')} Ft</td>
                              <td style={{ ...ui.td, color: '#34d399', fontWeight: '700' }}>
                                {l.is_teacher_admin 
                                  ? `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft (Teljes)` 
                                  : `${(l.commission_amount || 0).toLocaleString('hu-HU')} Ft`}
                              </td>
                              <td style={ui.td}>
                                <select 
                                  value={l.payment_status || (l.is_paid ? 'cash' : 'unpaid')} 
                                  onChange={e => handlePaymentChange(l.id, e.target.value)}
                                  style={{
                                    ...ui.input,
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '0.8rem',
                                    background: l.payment_status === 'settled' ? 'rgba(59, 130, 246, 0.2)' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                                    borderColor: l.payment_status === 'settled' ? '#3b82f6' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? '#10b981' : '#ef4444'),
                                    color: '#fff'
                                  }}
                                >
                                  <option value="unpaid" style={{ background: '#0f2318' }}>❌ Kifizetetlen</option>
                                  <option value="cash" style={{ background: '#0f2318' }}>💵 Készpénz</option>
                                  <option value="transfer" style={{ background: '#0f2318' }}>🏦 Átutalás</option>
                                  <option value="settled" style={{ background: '#0f2318' }}>🤝 Rendezve</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={ui.glassCard} className="fade-in-up">
            <h3 style={ui.sectionTitle}><MessageSquare size={20} color="#34d399"/> Belső Üzenetküldő Központ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', minHeight: '450px' }}>
              <div style={{ borderRight: '1px solid rgba(52, 211, 153, 0.15)', paddingRight: '1rem' }}>
                <h4 style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '0.8rem' }}>KAPCSOLATOK</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {conversations.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Nincsenek elérhető elbeszélgetések.</p>
                  ) : (
                    conversations.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedUser(c)} 
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: selectedUser?.id === c.id ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                          color: selectedUser?.id === c.id ? '#34d399' : '#cbd5e1',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.full_name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.role === 'teacher' ? 'Tanár' : (c.role === 'student' ? 'Diák' : 'Admin')}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                {selectedUser ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Beszélgetés: <span style={{ color: '#34d399' }}>{selectedUser.full_name}</span>
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {messages.length === 0 ? (
                          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Még nincs üzenetváltás.</p>
                        ) : (
                          messages.map(m => {
                            const isMe = m.sender_id === user.id;
                            return (
                              <div 
                                key={m.id} 
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                                  maxWidth: '75%',
                                  background: isMe ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.08)',
                                  color: '#fff',
                                  padding: '0.7rem 1rem',
                                  borderRadius: '12px',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {m.content && <p style={{ margin: 0, lineHeight: '1.4' }}>{m.content}</p>}
                                {m.file_url && (
                                  <a 
                                    href={m.file_url.startsWith('http') ? m.file_url : `${UPLOADS_BASE}${m.file_url}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a7f3d0', marginTop: '0.4rem', fontSize: '0.8rem', textDecoration: 'underline' }}
                                  >
                                    <Paperclip size={14}/> Csatolt Fájl Megtekintése
                                  </a>
                                )}
                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem', textAlign: 'right' }}>
                                  {new Date(m.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Írj üzenetet..." 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        style={{ ...ui.input, flex: 1 }} 
                      />
                      <label style={{ ...ui.secondaryBtnInline, padding: '0.7rem', cursor: 'pointer' }}>
                        <Paperclip size={16}/>
                        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ display: 'none' }} />
                      </label>
                      <button type="submit" style={{ ...ui.primaryBtnInline, padding: '0.7rem 1.2rem' }} className="btn-hover">
                        <Send size={16}/>
                      </button>
                    </form>
                    {selectedFile && (
                      <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.4rem' }}>
                        Csatolt fájl: {selectedFile.name}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                    Válassz egy kapcsolatot a beszélgetés indításához.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <Profile user={user} token={token} setUser={setUser} />
        )}

      </main>
    </div>
  );
}