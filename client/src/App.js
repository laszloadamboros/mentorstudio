import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, User, Clock, BookOpen, Phone, Mail, LogOut, 
  Plus, Trash2, GraduationCap, Sparkles, ChevronRight, UserPlus, ShieldCheck,
  Megaphone, Pin, MessageSquare, Send, Search, CheckCircle2, AlertCircle, FileText,
  Users, CreditCard, KeyRound, ArrowLeft, Paperclip, Download, LogIn, MapPin, Layout,
  FileSpreadsheet, Printer, TrendingUp, DollarSign, CheckSquare, BarChart3, PieChart, Edit, Repeat, Save, X, Calculator, School, ChevronDown
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
  .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in { animation: fadeIn 0.3s ease-out forwards; }
  .btn-hover { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-2px); filter: brightness(1.15); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25); }
  .card-hover { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  .card-hover:hover { transform: translateY(-4px); border-color: rgba(52, 211, 153, 0.5) !important; box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
  
  .glass-effect {
    background: rgba(10, 25, 18, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(52, 211, 153, 0.18);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: rgba(8, 20, 14, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(52, 211, 153, 0.25);
    border-radius: 12px;
    padding: 0.5rem;
    min-width: 200px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.6);
    z-index: 1000;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.7rem 1rem;
    color: #cbd5e1;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    text-align: left;
  }

  .dropdown-item:hover {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }

  @media print {
    body * { visibility: hidden; }
    #printable-earnings-section, #printable-earnings-section * { visibility: visible; }
    #printable-earnings-section { position: absolute; left: 0; top: 0; width: 100%; color: #000 !important; background: #fff !important; }
    .no-print { display: none !important; }
  }
`;

const ui = {
  landingPageContainer: { minHeight: '100vh', backgroundColor: '#030805', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  publicHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 3rem', background: 'rgba(5, 15, 10, 0.75)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', position: 'sticky', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' },
  brandText: { fontSize: '1.4rem', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 30%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' },
  heroSection: { padding: '7rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15) 0%, rgba(3, 8, 5, 0) 65%)', position: 'relative' },
  heroContent: { maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroTitle: { fontSize: '3.8rem', fontWeight: '900', color: '#fff', marginBottom: '1.2rem', letterSpacing: '-1.5px', lineHeight: '1.1' },
  heroSubtitle: { fontSize: '1.3rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '680px' },
  sectionContainer: { maxWidth: '1150px', margin: '0 auto', padding: '5rem 1.5rem' },
  landingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'center' },
  landingSectionTitle: { fontSize: '2.2rem', fontWeight: '800', color: '#fff', marginBottom: '1.2rem', letterSpacing: '-0.5px' },
  landingText: { color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.8' },
  placeholderTeamBox: { width: '100%', height: '280px', background: 'rgba(10, 25, 18, 0.5)', borderRadius: '20px', border: '2px dashed rgba(52, 211, 153, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  activitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' },
  activityCard: { background: 'rgba(10, 25, 18, 0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '2rem 1.5rem', borderRadius: '18px', textAlign: 'center' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' },
  contactCard: { background: 'rgba(10, 25, 18, 0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '2rem 1.5rem', borderRadius: '18px', textAlign: 'center' },
  publicFooter: { padding: '2.5rem', textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(52, 211, 153, 0.1)', background: '#020503' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 4, 0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  loginCard: { background: '#07150d', border: '1px solid rgba(52, 211, 153, 0.35)', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' },
  brandHeader: { marginBottom: '1.8rem', textAlign: 'center' },
  loginTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  loginSubtitle: { fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.4rem' },
  formGap: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.8px' },
  input: { background: 'rgba(3, 10, 6, 0.7)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.85rem 1.1rem', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s ease' },
  primaryBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '0.9rem 1.4rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' },
  primaryBtnInline: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
  secondaryBtnInline: { background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.18)', padding: '0.55rem 1.1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  linkBtn: { background: 'none', border: 'none', color: '#34d399', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', fontWeight: '600' },
  errorBadge: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  successBadge: { background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  appLayout: { minHeight: '100vh', backgroundColor: '#030805', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 3rem', background: 'rgba(5, 15, 10, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', position: 'sticky', top: 0, zIndex: 100 },
  roleTag: { background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontSize: '0.7rem', fontWeight: '800', padding: '0.25rem 0.6rem', borderRadius: '8px', letterSpacing: '0.5px' },
  navLinks: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  logoutBtn: { background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.6rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' },
  mainContent: { maxWidth: '1150px', margin: '2.5rem auto', padding: '0 1.5rem' },
  glassCard: { background: 'rgba(10, 25, 18, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(52, 211, 153, 0.18)', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.8rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  pinnedCard: { background: 'rgba(234, 179, 8, 0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(234, 179, 8, 0.35)', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.8rem' },
  highlightCard: { background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.04) 100%)', backdropFilter: 'blur(16px)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.8rem' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '-0.3px' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' },
  cardTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#fff' },
  cardDesc: { color: '#cbd5e1', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' },
  deleteBtn: { background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' },
  editBtn: { background: 'rgba(52, 211, 153, 0.15)', border: 'none', color: '#34d399', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', marginRight: '0.5rem' },
  emptyText: { color: '#64748b', fontStyle: 'italic', padding: '1rem 0' },
  gridGap: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  pinTag: { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.9rem' },
  checkbox: { accentColor: '#10b981', width: '18px', height: '18px', cursor: 'pointer' },
  badge: { background: 'rgba(52, 211, 153, 0.18)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  timeTag: { background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.85rem', borderBottom: '2px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.85rem', fontWeight: '700' },
  td: { padding: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' },
  welcomeHeader: { background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.03) 100%)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }
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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);

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

  const [editingAboutUsId, setEditingAboutUsId] = useState(null);
  const [editAboutUsData, setEditAboutUsData] = useState({ name: '', description: '' });
  const [editAboutUsImage, setEditAboutUsImage] = useState(null);

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
    if (token && (activeTab === 'teachers' || activeTab === 'searchTeachers')) {
      fetchTeachers();
    }
  }, [activeTab, token, fetchTeachers]);

  useEffect(() => {
    if (selectedUser && token) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, token, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

    try {
      const formData = new FormData();
      formData.append('receiver_id', selectedUser.id);
      formData.append('content', newMessage);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Hiba az üzenet küldésekor');

      setNewMessage('');
      setSelectedFile(null);
      fetchMessages(selectedUser.id);
    } catch (err) {
      alert(err.message);
    }
  };

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

  const handleStartEditAboutUs = (item) => {
    setEditingAboutUsId(item.id);
    setEditAboutUsData({
      name: item.name || '',
      description: item.description || ''
    });
    setEditAboutUsImage(null);
  };

  const handleSaveEditAboutUs = async (id) => {
    try {
      const formData = new FormData();
      formData.append('name', editAboutUsData.name);
      formData.append('description', editAboutUsData.description);
      if (editAboutUsImage) {
        formData.append('image', editAboutUsImage);
      }

      const res = await fetch(`${API_BASE}/about-us/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Hiba a névjegy frissítésekor');
      setEditingAboutUsId(null);
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
      custom_price: lesson.payment_status === 'settled' ? 0 : (lesson.calculated_price || lesson.custom_price || 0)
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
    } catch (err) { alert(err.message); }
  };

  const handlePaymentChange = async (lessonId, newStatus) => {
    setLessons(prev => prev.map(l => 
      l.id === lessonId ? { ...l, payment_status: newStatus, is_paid: newStatus !== 'unpaid' } : l
    ));

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
    } catch (err) {
      console.error('Fizetési státusz mentési hiba:', err.message);
      if (user.role === 'teacher') fetchTeacherData();
    }
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

    const isAdminUser = user?.is_admin || user?.id === 1;

    const lessonList = filteredLessons.map(l => {
      const start = new Date(l.start_time);
      const end = new Date(l.end_time);
      const durationMins = Math.round((end - start) / (1000 * 60));
      
      const isSettled = l.payment_status === 'settled';
      const price = isSettled ? 0 : (l.calculated_price || l.custom_price || 0);
      let commission = 0;

      if (!isSettled) {
        if (durationMins >= 80) {
          commission = 2000;
        } else {
          commission = 1500;
        }
      }

      const isOwnLesson = Number(l.teacher_id) === Number(user?.id);
      let net = 0;

      if (isAdminUser) {
        if (selectedTeacherId) {
          const isSelectedTeacherOwn = Number(l.teacher_id) === Number(selectedTeacherId);
          if (isSelectedTeacherOwn) {
            totalGross += price;
            totalCommission += commission;
            net = price - commission;
            if (!isSettled) {
              if (durationMins >= 80) count100++; else count50++;
            }
          }
        } else {
          if (isOwnLesson) {
            totalGross += price;
            net = price;
          } else {
            totalCommission += commission;
            net = commission;
            if (!isSettled) {
              if (durationMins >= 80) count100++; else count50++;
            }
          }
        }
      } else {
        if (!isSettled) {
          if (durationMins >= 80) count100++; else count50++;
        }
        totalGross += price;
        totalCommission += commission;
        net = price - commission;
      }

      return {
        ...l,
        durationMins,
        price,
        commission,
        net,
        isOwnLesson
      };
    });

    return {
      totalGross,
      totalCommission,
      netEarnings: isAdminUser 
        ? (selectedTeacherId ? (totalGross - totalCommission) : (totalGross + totalCommission)) 
        : (totalGross - totalCommission),
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
            <img src={logoSrc} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
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
            <img src={logoSrc} alt="Logo" style={{ width: '130px', height: '130px', objectFit: 'contain', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 25px rgba(52, 211, 153, 0.4))' }} className="fade-in-up" />
            <h1 style={ui.heroTitle} className="fade-in-up">{landingData.title}</h1>
            <p style={ui.heroSubtitle} className="fade-in-up">{landingData.subtitle}</p>
            <button 
              onClick={() => setShowLoginModal(true)} 
              style={{ ...ui.primaryBtn, width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', marginTop: '2rem' }} 
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
                  style={{ width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid rgba(52, 211, 153, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} 
                />
              </div>
            ) : (
              <div style={ui.placeholderTeamBox}>
                <Users size={48} color="#34d399"/>
                <p style={{ marginTop: '0.8rem', color: '#a7f3d0', fontWeight: '600' }}>Csapatkép hamarosan...</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ ...ui.sectionContainer, background: 'rgba(10, 25, 18, 0.35)', borderRadius: '32px', border: '1px solid rgba(52, 211, 153, 0.1)' }}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2.5rem' }}>Tevékenységi Köreink</h2>
          <div style={ui.activitiesGrid}>
            {landingData.activities.split(',').map((act, idx) => (
              <div key={idx} style={ui.activityCard} className="card-hover">
                <Sparkles size={28} color="#34d399" style={{ marginBottom: '0.8rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>{act.trim()}</h3>
              </div>
            ))}
          </div>
        </section>

        <section style={ui.sectionContainer}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2.5rem' }}>Kapcsolat & Elérhetőségek</h2>
          <div style={ui.contactGrid}>
            <div style={ui.contactCard} className="card-hover">
              <Phone size={28} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.8rem 0 0.3rem 0', fontSize: '1.1rem' }}>Telefon</h4>
              <p style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem' }}>{landingData.phone}</p>
            </div>

            <div style={ui.contactCard} className="card-hover">
              <Mail size={28} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.8rem 0 0.3rem 0', fontSize: '1.1rem' }}>E-mail</h4>
              <p style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem' }}>{landingData.email}</p>
            </div>

            <div style={ui.contactCard} className="card-hover">
              <MapPin size={28} color="#34d399"/>
              <h4 style={{ color: '#a7f3d0', margin: '0.8rem 0 0.3rem 0', fontSize: '1.1rem' }}>Címünk</h4>
              <p style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem' }}>{landingData.address}</p>
            </div>
          </div>
        </section>

        <footer style={ui.publicFooter}>
          <p>© {new Date().getFullYear()} {landingData.title}. Minden jog fenntartva.</p>
        </footer>

        {(showLoginModal || resetToken) && (
          <div style={ui.modalOverlay}>
            <div style={ui.loginCard} className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src={logoSrc} alt="Logo" style={{ width: '36px', height: '36px' }} />
                  <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{landingData.title}</span>
                </div>
                {!resetToken && (
                  <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
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
                    style={{ ...ui.secondaryBtnInline, width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
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
                    style={{ ...ui.secondaryBtnInline, width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
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

  const getMenuTabs = () => {
    const tabs = [
      { id: 'news', label: 'Hírfolyam', icon: Megaphone },
      { id: 'about', label: 'Névjegy', icon: Users }
    ];

    if (user?.role === 'student') {
      tabs.push(
        { id: 'events', label: 'Óráim', icon: BookOpen },
        { id: 'searchTeachers', label: 'Tanárkereső', icon: Search },
        { id: 'contact', label: 'Tanárom', icon: Phone }
      );
    } else {
      tabs.push(
        { id: 'calendar', label: 'Naptár', icon: CalendarIcon },
        { id: 'students', label: 'Diákok', icon: GraduationCap },
        { id: 'earnings', label: 'Kereset kimutatás', icon: Calculator }
      );

      if (user?.is_admin || user?.id === 1) {
        tabs.push(
          { id: 'teachers', label: 'Tanárok', icon: ShieldCheck },
          { id: 'editLanding', label: 'Kezdőlap szerkesztése', icon: Layout }
        );
      }
    }

    tabs.push(
      { id: 'messages', label: 'Üzenetek', icon: MessageSquare },
      { id: 'profile', label: 'Profil', icon: User }
    );

    return tabs;
  };

  const navTabs = getMenuTabs();
  const currentActiveTabObj = navTabs.find(t => t.id === activeTab) || navTabs[0];

  return (
    <div style={ui.appLayout}>
      <style>{animations}</style>
      
      <header style={ui.navbar}>
        <div style={ui.navBrand} onClick={() => setActiveTab('news')}>
          <img src={logoSrc} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          <span style={ui.brandText}>{landingData.title}</span>
          <span style={ui.roleTag}>{(user?.is_admin || user?.id === 1) ? 'ADMIN' : (user?.role === 'teacher' ? 'TANÁR' : 'DIÁK')}</span>
        </div>

        <nav style={ui.navLinks}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)} 
              style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#34d399',
                padding: '0.65rem 1.2rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
              className="btn-hover"
            >
              <currentActiveTabObj.icon size={18} />
              <span>{currentActiveTabObj.label}</span>
              <ChevronDown size={16} style={{ transform: isNavDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
            </button>

            {isNavDropdownOpen && (
              <div className="dropdown-menu fade-in-up">
                {navTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsNavDropdownOpen(false);
                      }}
                      className="dropdown-item"
                      style={{
                        background: activeTab === tab.id ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                        color: activeTab === tab.id ? '#34d399' : '#cbd5e1',
                        fontWeight: activeTab === tab.id ? '700' : '500'
                      }}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={ui.logoutBtn} className="btn-hover">
            <LogOut size={16} /> Kilépés
          </button>
        </nav>
      </header>

      <main style={ui.mainContent} className="fade-in">

        <div style={ui.welcomeHeader} className="fade-in-up">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
              Üdvözöljük újra, <span style={{ color: '#34d399' }}>{user?.full_name || 'Felhasználó'}</span>!
            </h2>
            <p style={{ color: '#94a3b8', margin: '0.4rem 0 0 0', fontSize: '1rem' }}>
              Jó újra látni a Mentorstúdió felületén. Tervezd meg a mai napodat hatékonyan!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(3, 10, 6, 0.6)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.8rem 1.2rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Clock size={24} color="#34d399" />
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>PONTOS IDŐ</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                  {currentTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(3, 10, 6, 0.6)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.8rem 1.2rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CalendarIcon size={24} color="#34d399" />
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>MAI DÁTUM</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                  {currentTime.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

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
                      {editingAboutUsId === item.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h4 style={{ color: '#34d399', margin: 0 }}>Névjegy Szerkesztése (#{item.id})</h4>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>NÉV / CÍM</label>
                            <input 
                              type="text" 
                              value={editAboutUsData.name} 
                              onChange={e => setEditAboutUsData({ ...editAboutUsData, name: e.target.value })} 
                              style={ui.input} 
                              required 
                            />
                          </div>
                          
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>KÉP CSERÉJE (OPCIONÁLIS)</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => setEditAboutUsImage(e.target.files[0])} 
                              style={ui.input} 
                            />
                          </div>

                          <div style={ui.inputGroup}>
                            <label style={ui.label}>BEMUTATKOZÓ SZÖVEG</label>
                            <textarea 
                              value={editAboutUsData.description} 
                              onChange={e => setEditAboutUsData({ ...editAboutUsData, description: e.target.value })} 
                              style={{ ...ui.input, height: '100px' }} 
                              required
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={() => handleSaveEditAboutUs(item.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                            <button onClick={() => setEditingAboutUsId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                          </div>
                        </div>
                      ) : (
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
                                <div>
                                  <button onClick={() => handleStartEditAboutUs(item)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                                  <button onClick={() => handleDeleteAboutUs(item.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                                </div>
                              )}
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.description}</p>
                          </div>
                        </div>
                      )}
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
                <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Óradíj: {todayLesson.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(todayLesson.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
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
                    <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
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
                    <p style={{ color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>Díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
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
                          Beállított díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}
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
                            <option value="settled" style={{ background: '#0f2318' }}>🤝 Rendezve (0 Ft / Jutalék mentes)</option>
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

        {user?.role === 'teacher' && activeTab === 'earnings' && (
          <div id="printable-earnings-section" style={ui.glassCard} className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ ...ui.sectionTitle, margin: 0 }}><Calculator size={22} color="#34d399"/> Kereset Kimutatás</h3>
              <button onClick={() => window.print()} style={ui.primaryBtnInline} className="btn-hover no-print"><Printer size={16}/> Nyomtatás / PDF</button>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {(user?.is_admin || user?.id === 1) 
                ? (selectedTeacherId 
                    ? 'A kiválasztott tanár óráiból befolyt bruttó összeg, a levont jutalék (50 perc: 1.500 Ft, 100 perc: 2.000 Ft), valamint a tanár által kézhez kapandó nettó kereset.' 
                    : 'Az alábbiakban láthatod a saját óráidból befolyt bruttó összeget, a más tanárok után kapott jutalékot (50 perc: 1.500 Ft, 100 perc: 2.000 Ft), valamint a teljes nettó keresetedet.') 
                : 'Az alábbiakban láthatod a beállított óradíjaid alapján befolyt bruttó összeget, a rendszerhasználati díjat (50 perces óránként 1.500 Ft, 100 perces óránként 2.000 Ft), valamint a levonás utáni végleges nettó keresetedet.'}
            </p>

            {(user?.is_admin || user?.id === 1) && (
              <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>TANÁRI SZŰRŐ (ADMIN):</label>
                <select 
                  value={selectedTeacherId} 
                  onChange={e => setSelectedTeacherId(e.target.value)} 
                  style={{ ...ui.input, minWidth: '220px' }}
                >
                  <option value="">Összes tanár nézete (Admin)</option>
                  {scheduleTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem', background: 'rgba(5, 15, 10, 0.5)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.5px' }}>
                    {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'TANÁR BEFOLYT BRUTTÓ ÖSSZEG' : 'SAJÁT ÓRÁK (BRUTTÓ)') : 'BEFOLYT BRUTTÓ ÖSSZEG'}
                  </span>
                  <DollarSign size={20} color="#60a5fa"/>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0 0.2rem 0' }}>
                  {teacherEarningsData.totalGross.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'A kiválasztott tanár megtartott órái' : 'Saját megtartott óráid díja') : 'Diákok által fizetett összeg'}
                </span>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)', padding: '1.3rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f87171', letterSpacing: '0.5px' }}>
                    {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'LEVONT JUTALÉK' : 'KAPOTT JUTALÉK (MÁS TANÁROK)') : 'LEVONT JUTALÉK (KORNYA.KMS)'}
                  </span>
                  <TrendingUp size={20} color="#f87171"/>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0 0.2rem 0' }}>
                  {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? '-' : '+') : '-'}{teacherEarningsData.totalCommission.toLocaleString('hu-HU')} Ft
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
                <span style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Végső elszámolható egyenleg</span>
              </div>
            </div>

            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Részletezett Óralista az Időszakban</h4>
            {teacherEarningsData.lessonList.length === 0 ? (
              <p style={ui.emptyText}>A kiválasztott időszakban nincs elszámolható óra.</p>
            ) : (
              <table style={ui.table}>
                <thead>
                  <tr>
                    <th style={ui.th}>Időpont</th>
                    <th style={ui.th}>Diák</th>
                    <th style={ui.th}>Tantárgy</th>
                    <th style={ui.th}>Időtartam</th>
                    <th style={ui.th}>Bruttó díj</th>
                    <th style={ui.th}>Jutalék</th>
                    <th style={ui.th}>Nettó</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherEarningsData.lessonList.map(item => (
                    <tr key={item.id}>
                      <td style={ui.td}>{formatLessonTime(item.start_time, item.end_time)}</td>
                      <td style={ui.td}>{item.student_name || 'Diák'}</td>
                      <td style={ui.td}>{item.subject}</td>
                      <td style={ui.td}>{item.durationMins} perc</td>
                      <td style={ui.td}>{item.price.toLocaleString('hu-HU')} Ft</td>
                      <td style={{ ...ui.td, color: '#f87171' }}>{item.commission.toLocaleString('hu-HU')} Ft</td>
                      <td style={{ ...ui.td, color: '#34d399', fontWeight: '700' }}>{item.net.toLocaleString('hu-HU')} Ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {user?.role === 'teacher' && activeTab === 'students' && (
          <div>
            <div style={ui.glassCard} className="fade-in-up">
              <h3 style={ui.sectionTitle}><UserPlus size={20} color="#34d399"/> Új Diák Regisztrálása</h3>
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" value={newStudent.full_name} onChange={e => setNewStudent({...newStudent, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ISKOLA</label>
                    <input type="text" value={newStudent.school} onChange={e => setNewStudent({...newStudent, school: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>OSZTÁLY</label>
                    <input type="text" value={newStudent.class_name} onChange={e => setNewStudent({...newStudent, class_name: e.target.value})} style={ui.input} />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>MEGJEGYZÉS / MEGJEGYZÉSEK A DIÁKRÓL</label>
                  <textarea value={newStudent.notes} onChange={e => setNewStudent({...newStudent, notes: e.target.value})} style={{ ...ui.input, height: '60px' }}></textarea>
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={18}/> Diák Regisztrálása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Regisztrált Diákok</h3>
            <div style={ui.gridGap}>
              {students.length === 0 ? (
                <p style={ui.emptyText}>Még nincsenek regisztrált diákok.</p>
              ) : (
                students.map(s => (
                  <div key={s.id} style={ui.glassCard} className="card-hover">
                    {editingStudentId === s.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: '#34d399', margin: 0 }}>Diák Adatainak Szerkesztése (#{s.id})</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>NÉV</label>
                            <input type="text" value={editStudentData.full_name} onChange={e => setEditStudentData({ ...editStudentData, full_name: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>E-MAIL</label>
                            <input type="email" value={editStudentData.email} onChange={e => setEditStudentData({ ...editStudentData, email: e.target.value })} style={ui.input} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>ISKOLA</label>
                            <input type="text" value={editStudentData.school} onChange={e => setEditStudentData({ ...editStudentData, school: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>OSZTÁLY</label>
                            <input type="text" value={editStudentData.class_name} onChange={e => setEditStudentData({ ...editStudentData, class_name: e.target.value })} style={ui.input} />
                          </div>
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>MEGJEGYZÉSEK</label>
                          <textarea value={editStudentData.notes} onChange={e => setEditStudentData({ ...editStudentData, notes: e.target.value })} style={{ ...ui.input, height: '60px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleSaveEditStudent(s.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                          <button onClick={() => setEditingStudentId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={ui.cardHeaderRow}>
                          <div>
                            <h4 style={ui.cardTitle}>{s.full_name}</h4>
                            <span style={{ color: '#34d399', fontSize: '0.85rem' }}>{s.email}</span>
                          </div>
                          <div>
                            <button onClick={() => handleStartEditStudent(s)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteStudent(s.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {s.school && <span><School size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> {s.school}</span>}
                          {(s.class_name || s.student_class) && <span><GraduationCap size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> {s.class_name || s.student_class}</span>}
                        </div>

                        {s.notes && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Megjegyzés: {s.notes}</p>}
                      </>
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
              <h3 style={ui.sectionTitle}><ShieldCheck size={20} color="#34d399"/> Új Tanár Hozzáadása (Admin)</h3>
              <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" value={newTeacher.full_name} onChange={e => setNewTeacher({...newTeacher, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELEFON</label>
                    <input type="text" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>SZAK / TANTÁRGY</label>
                    <input type="text" value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>50 PERCES ÓRADÍJ (FT)</label>
                    <input type="number" value={newTeacher.hourly_rate_50} onChange={e => setNewTeacher({...newTeacher, hourly_rate_50: parseInt(e.target.value) || 0})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>100 PERCES ÓRADÍJ (FT)</label>
                    <input type="number" value={newTeacher.hourly_rate_100} onChange={e => setNewTeacher({...newTeacher, hourly_rate_100: parseInt(e.target.value) || 0})} style={ui.input} required />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>BEMUTATKOZÁS (BIO)</label>
                  <textarea value={newTeacher.bio} onChange={e => setNewTeacher({...newTeacher, bio: e.target.value})} style={{ ...ui.input, height: '60px' }}></textarea>
                </div>

                <label style={ui.checkboxLabel}>
                  <input type="checkbox" checked={newTeacher.is_admin} onChange={e => setNewTeacher({...newTeacher, is_admin: e.target.checked})} style={ui.checkbox} />
                  <span>Adminisztrátori jogok megadása</span>
                </label>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={18}/> Tanár Regisztrálása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Tanárok Listája</h3>
            <div style={ui.gridGap}>
              {teachers.length === 0 ? (
                <p style={ui.emptyText}>Még nincsenek regisztrált tanárok.</p>
              ) : (
                teachers.map(t => (
                  <div key={t.id} style={ui.glassCard} className="card-hover">
                    {editingTeacherId === t.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: '#34d399', margin: 0 }}>Tanár Szerkesztése (#{t.id})</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>TELJES NÉV</label>
                            <input type="text" value={editTeacherData.full_name} onChange={e => setEditTeacherData({ ...editTeacherData, full_name: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>E-MAIL</label>
                            <input type="email" value={editTeacherData.email} onChange={e => setEditTeacherData({ ...editTeacherData, email: e.target.value })} style={ui.input} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>TELEFON</label>
                            <input type="text" value={editTeacherData.phone} onChange={e => setEditTeacherData({ ...editTeacherData, phone: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>SZAK</label>
                            <input type="text" value={editTeacherData.subject} onChange={e => setEditTeacherData({ ...editTeacherData, subject: e.target.value })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>ADMINISZTRÁTOR?</label>
                            <select value={editTeacherData.is_admin ? 'true' : 'false'} onChange={e => setEditTeacherData({ ...editTeacherData, is_admin: e.target.value === 'true' })} style={ui.input}>
                              <option value="false">Nem</option>
                              <option value="true">Igen</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>50 PERCES DÍJ</label>
                            <input type="number" value={editTeacherData.hourly_rate_50} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_50: parseInt(e.target.value) || 0 })} style={ui.input} />
                          </div>
                          <div style={ui.inputGroup}>
                            <label style={ui.label}>100 PERCES DÍJ</label>
                            <input type="number" value={editTeacherData.hourly_rate_100} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_100: parseInt(e.target.value) || 0 })} style={ui.input} />
                          </div>
                        </div>

                        <div style={ui.inputGroup}>
                          <label style={ui.label}>BIO</label>
                          <textarea value={editTeacherData.bio} onChange={e => setEditTeacherData({ ...editTeacherData, bio: e.target.value })} style={{ ...ui.input, height: '60px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleSaveEditTeacher(t.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={16}/> Mentés</button>
                          <button onClick={() => setEditingTeacherId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={16}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={ui.cardHeaderRow}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <h4 style={ui.cardTitle}>{t.full_name}</h4>
                              {Boolean(t.is_admin) && <span style={ui.badge}><ShieldCheck size={12}/> Admin</span>}
                            </div>
                            <span style={{ color: '#34d399', fontSize: '0.85rem' }}>{t.email}</span>
                          </div>
                          <div>
                            <button onClick={() => handleStartEditTeacher(t)} style={ui.editBtn} className="btn-hover"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteTeacher(t.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={16}/></button>
                          </div>
                        </div>

                        <p style={ui.cardDesc}><BookOpen size={16}/> Szak: {t.subject || 'Nincs megadva'}</p>
                        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                          50 perc: {t.hourly_rate_50 || 5000} Ft | 100 perc: {t.hourly_rate_100 || 9000} Ft
                        </p>
                        {t.bio && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>{t.bio}</p>}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', minHeight: '550px' }}>
            <div style={ui.glassCard}>
              <h4 style={{ color: '#34d399', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18}/> BESZÉLGETÉSEK
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {conversations.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Nincsenek elérhető beszélgetések.</p>
                ) : (
                  conversations.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        background: selectedUser?.id === u.id ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: selectedUser?.id === u.id ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        transition: 'all 0.2s'
                      }}
                      className="btn-hover"
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{u.full_name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.role === 'teacher' ? 'Tanár' : 'Diák'}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...ui.glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {selectedUser ? (
                <>
                  <div style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{selectedUser.full_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#34d399' }}>{selectedUser.email}</span>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem', maxHeight: '380px' }}>
                    {messages.length === 0 ? (
                      <p style={{ ...ui.emptyText, textAlign: 'center' }}>Még nincs üzenetváltás. Írj egy üzenetet!</p>
                    ) : (
                      messages.map(m => {
                        const isMe = m.sender_id === user?.id;
                        return (
                          <div 
                            key={m.id} 
                            style={{ 
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              background: isMe ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.08)',
                              color: '#fff',
                              padding: '0.8rem 1.1rem',
                              borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          >
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{m.content}</p>
                            
                            {m.file_url && (
                              <a 
                                href={m.file_url.startsWith('http') ? m.file_url : `${UPLOADS_BASE}${m.file_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isMe ? '#a7f3d0' : '#34d399', fontSize: '0.8rem', marginTop: '0.5rem', textDecoration: 'underline' }}
                              >
                                <Paperclip size={14}/> Melléklet letöltése
                              </a>
                            )}

                            <span style={{ display: 'block', fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : '#64748b', textAlign: 'right', marginTop: '0.3rem' }}>
                              {new Date(m.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <label style={{ cursor: 'pointer', color: '#34d399', padding: '0.6rem' }} title="Fájl csatolása">
                      <Paperclip size={20} />
                      <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ display: 'none' }} />
                    </label>

                    {selectedFile && (
                      <span style={{ fontSize: '0.75rem', color: '#a7f3d0', background: 'rgba(52,211,153,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {selectedFile.name.substring(0, 12)}...
                      </span>
                    )}

                    <input 
                      type="text" 
                      placeholder="Írj üzenetet..." 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)} 
                      style={{ ...ui.input, flex: 1 }} 
                    />

                    <button type="submit" style={ui.primaryBtnInline} className="btn-hover">
                      <Send size={16}/> Küldés
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                  <MessageSquare size={48} color="#34d399" style={{ opacity: 0.5, marginBottom: '0.8rem' }} />
                  <p>Válassz ki egy beszélgetést a bal oldali listából!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={ui.glassCard} className="fade-in-up">
            <Profile user={user} token={token} setUser={setUser} />
          </div>
        )}

      </main>
    </div>
  );
}