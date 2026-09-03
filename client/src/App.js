import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, User, Clock, BookOpen, Phone, Mail, LogOut, 
  Plus, Trash2, GraduationCap, Sparkles, ChevronRight, UserPlus, ShieldCheck,
  Megaphone, Pin, MessageSquare, Send, Search, CheckCircle2, AlertCircle, FileText,
  Users, CreditCard, KeyRound, ArrowLeft, Paperclip, Download, LogIn, MapPin, Layout,
  FileSpreadsheet, Printer, TrendingUp, DollarSign, CheckSquare, BarChart3, PieChart, Edit, Repeat, Save, X, Calculator, School, ChevronDown,
  Building2, Briefcase, Award, ArrowUpRight
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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); }
  
  .card-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .card-hover:hover { border-color: rgba(16, 185, 129, 0.4) !important; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
  
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: #0d1512;
    border: 1px solid #1e2e28;
    border-radius: 8px;
    padding: 0.4rem;
    min-width: 220px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 1000;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.65rem 0.85rem;
    color: #94a3b8;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s ease;
    text-align: left;
  }

  .dropdown-item:hover {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  /* Custom Scrollbar for Executive Theme */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #060b09;
  }
  ::-webkit-scrollbar-thumb {
    background: #1e2e28;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #10b981;
  }

  @media print {
    body * { visibility: hidden; }
    #printable-earnings-section, #printable-earnings-section * { visibility: visible; }
    #printable-earnings-section { position: absolute; left: 0; top: 0; width: 100%; color: #000 !important; background: #fff !important; }
    .no-print { display: none !important; }
  }
`;

const ui = {
  landingPageContainer: { minHeight: '100vh', backgroundColor: '#060b09', color: '#f8fafc', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  publicHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 3rem', background: '#09120e', borderBottom: '1px solid #1a2922', position: 'sticky', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' },
  brandText: { fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.3px' },
  heroSection: { padding: '6rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, rgba(6, 11, 9, 0) 70%)', borderBottom: '1px solid #121f19' },
  heroContent: { maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroTitle: { fontSize: '3.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.2rem', letterSpacing: '-1px', lineHeight: '1.15' },
  heroSubtitle: { fontSize: '1.15rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '640px' },
  sectionContainer: { maxWidth: '1150px', margin: '0 auto', padding: '4.5rem 1.5rem' },
  landingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'center' },
  landingSectionTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.4px' },
  landingText: { color: '#94a3b8', fontSize: '1rem', lineHeight: '1.7' },
  placeholderTeamBox: { width: '100%', height: '260px', background: '#0b1410', borderRadius: '8px', border: '1px solid #1a2922', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  activitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' },
  activityCard: { background: '#0b1410', border: '1px solid #1a2922', padding: '1.8rem 1.5rem', borderRadius: '8px', textAlign: 'left' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' },
  contactCard: { background: '#0b1410', border: '1px solid #1a2922', padding: '1.8rem 1.5rem', borderRadius: '8px', textAlign: 'left' },
  publicFooter: { padding: '2rem', textAlign: 'center', color: '#475569', borderTop: '1px solid #121f19', background: '#040706', fontSize: '0.85rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 6, 5, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  loginCard: { background: '#0a120e', border: '1px solid #1e2e28', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)' },
  brandHeader: { marginBottom: '1.5rem', textAlign: 'center' },
  loginTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.3px' },
  loginSubtitle: { fontSize: '0.875rem', color: '#64748b', marginTop: '0.3rem' },
  formGap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.7rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.6px', textTransform: 'uppercase' },
  input: { background: '#050a08', border: '1px solid #1e2e28', padding: '0.75rem 1rem', borderRadius: '6px', color: '#ffffff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.15s ease' },
  primaryBtn: { background: '#10b981', color: '#04120c', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', transition: 'all 0.15s ease' },
  primaryBtnInline: { background: '#10b981', color: '#04120c', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s ease' },
  secondaryBtnInline: { background: '#121f19', color: '#e2e8f0', border: '1px solid #1e2e28', padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  linkBtn: { background: 'none', border: 'none', color: '#10b981', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', fontWeight: '600' },
  errorBadge: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  successBadge: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  appLayout: { minHeight: '100vh', backgroundColor: '#060b09', color: '#f8fafc', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 2.5rem', background: '#09120e', borderBottom: '1px solid #1a2922', position: 'sticky', top: 0, zIndex: 100 },
  roleTag: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.65rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.5px' },
  navLinks: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  logoutBtn: { background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.55rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' },
  mainContent: { maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem' },
  glassCard: { background: '#0b1410', border: '1px solid #1a2922', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  pinnedCard: { background: '#0d1813', border: '1px solid #2d3f36', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  highlightCard: { background: '#0d1a14', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.2px' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' },
  cardDesc: { color: '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' },
  deleteBtn: { background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' },
  editBtn: { background: 'rgba(16, 185, 129, 0.1)', border: 'none', color: '#10b981', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.4rem' },
  emptyText: { color: '#475569', fontStyle: 'italic', padding: '1rem 0', fontSize: '0.875rem' },
  gridGap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  pinTag: { background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' },
  checkbox: { accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' },
  badge: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  timeTag: { background: '#121f19', border: '1px solid #1a2922', color: '#94a3b8', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.75rem 0.85rem', borderBottom: '1px solid #1a2922', color: '#10b981', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '0.75rem 0.85rem', borderBottom: '1px solid #121f19', fontSize: '0.85rem' },
  welcomeHeader: { background: '#0b1410', border: '1px solid #1a2922', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'center' }
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
            <img src={logoSrc} alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            <span style={ui.brandText}>{landingData.title}</span>
          </div>
          <button 
            onClick={() => setShowLoginModal(true)} 
            style={ui.primaryBtnInline} 
            className="btn-hover"
          >
            <LogIn size={16}/> Bejelentkezés
          </button>
        </header>

        <section style={ui.heroSection}>
          <div style={ui.heroContent}>
            <img src={logoSrc} alt="Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', marginBottom: '1.5rem' }} className="fade-in" />
            <h1 style={ui.heroTitle} className="fade-in">{landingData.title}</h1>
            <p style={ui.heroSubtitle} className="fade-in">{landingData.subtitle}</p>
            <button 
              onClick={() => setShowLoginModal(true)} 
              style={{ ...ui.primaryBtn, width: 'auto', padding: '0.85rem 2rem', fontSize: '0.95rem', marginTop: '2rem' }} 
              className="btn-hover fade-in"
            >
              Belépés az Oktatási Portálra <ChevronRight size={18}/>
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
                  style={{ width: '100%', maxWidth: '520px', borderRadius: '8px', border: '1px solid #1a2922' }} 
                />
              </div>
            ) : (
              <div style={ui.placeholderTeamBox}>
                <Users size={36} color="#10b981"/>
                <p style={{ marginTop: '0.8rem', color: '#64748b', fontWeight: '500', fontSize: '0.85rem' }}>Csapatkép hamarosan...</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ ...ui.sectionContainer, background: '#09120e', borderRadius: '8px', border: '1px solid #1a2922' }}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2.5rem' }}>Tevékenységi Köreink</h2>
          <div style={ui.activitiesGrid}>
            {landingData.activities.split(',').map((act, idx) => (
              <div key={idx} style={ui.activityCard} className="card-hover">
                <Briefcase size={22} color="#10b981" style={{ marginBottom: '0.8rem' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{act.trim()}</h3>
              </div>
            ))}
          </div>
        </section>

        <section style={ui.sectionContainer}>
          <h2 style={{ ...ui.landingSectionTitle, textAlign: 'center', marginBottom: '2.5rem' }}>Kapcsolat & Elérhetőségek</h2>
          <div style={ui.contactGrid}>
            <div style={ui.contactCard} className="card-hover">
              <Phone size={22} color="#10b981"/>
              <h4 style={{ color: '#10b981', margin: '0.8rem 0 0.3rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefon</h4>
              <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.95rem' }}>{landingData.phone}</p>
            </div>

            <div style={ui.contactCard} className="card-hover">
              <Mail size={22} color="#10b981"/>
              <h4 style={{ color: '#10b981', margin: '0.8rem 0 0.3rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-mail</h4>
              <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.95rem' }}>{landingData.email}</p>
            </div>

            <div style={ui.contactCard} className="card-hover">
              <MapPin size={22} color="#10b981"/>
              <h4 style={{ color: '#10b981', margin: '0.8rem 0 0.3rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Címünk</h4>
              <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.95rem' }}>{landingData.address}</p>
            </div>
          </div>
        </section>

        <footer style={ui.publicFooter}>
          <p>© {new Date().getFullYear()} {landingData.title}. Minden jog fenntartva.</p>
        </footer>

        {(showLoginModal || resetToken) && (
          <div style={ui.modalOverlay}>
            <div style={ui.loginCard} className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src={logoSrc} alt="Logo" style={{ width: '32px', height: '32px' }} />
                  <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '1rem' }}>{landingData.title}</span>
                </div>
                {!resetToken && (
                  <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
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

              {error && <div style={ui.errorBadge}><AlertCircle size={15}/> {error}</div>}
              {successMsg && <div style={ui.successBadge}><CheckCircle2 size={15}/> {successMsg}</div>}

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
                    Új jelszó mentése <KeyRound size={15} />
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
                    <ArrowLeft size={15} /> Vissza a bejelentkezéshez
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
                    Bejelentkezés <ChevronRight size={16} />
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
                    Visszaállító link küldése <KeyRound size={15} />
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
                    <ArrowLeft size={15} /> Vissza a bejelentkezéshez
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
          <img src={logoSrc} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <span style={ui.brandText}>{landingData.title}</span>
          <span style={ui.roleTag}>{(user?.is_admin || user?.id === 1) ? 'ADMIN' : (user?.role === 'teacher' ? 'TANÁR' : 'DIÁK')}</span>
        </div>

        <nav style={ui.navLinks}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)} 
              style={{
                background: '#0d1813',
                border: '1px solid #1a2922',
                color: '#10b981',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              className="btn-hover"
            >
              <currentActiveTabObj.icon size={16} />
              <span>{currentActiveTabObj.label}</span>
              <ChevronDown size={14} style={{ transform: isNavDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }} />
            </button>

            {isNavDropdownOpen && (
              <div className="dropdown-menu fade-in">
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
                        background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        color: activeTab === tab.id ? '#10b981' : '#94a3b8',
                        fontWeight: activeTab === tab.id ? '600' : '500'
                      }}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={ui.logoutBtn} className="btn-hover">
            <LogOut size={15} /> Kilépés
          </button>
        </nav>
      </header>

      <main style={ui.mainContent} className="fade-in">

        <div style={ui.welcomeHeader} className="fade-in">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
              Üdvözöljük újra, <span style={{ color: '#10b981' }}>{user?.full_name || 'Felhasználó'}</span>!
            </h2>
            <p style={{ color: '#64748b', margin: '0.3rem 0 0 0', fontSize: '0.875rem' }}>
              A mai nap áttekintése és az operatív feladatok kezelése.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ background: '#060b09', border: '1px solid #1a2922', padding: '0.6rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={18} color="#10b981" />
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>PONTOS IDŐ</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                  {currentTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            <div style={{ background: '#060b09', border: '1px solid #1a2922', padding: '0.6rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CalendarIcon size={18} color="#10b981" />
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>MAI DÁTUM</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>
                  {currentTime.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(user?.is_admin || user?.id === 1) && activeTab === 'editLanding' && (
          <div style={ui.glassCard} className="fade-in">
            <h3 style={ui.sectionTitle}><Layout size={18} color="#10b981"/> Bejelentkező Kezdőlap Szerkesztése</h3>
            <form onSubmit={handleUpdateLanding} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <textarea value={landingForm.about_text || ''} onChange={e => setLandingForm({...landingForm, about_text: e.target.value})} style={{ ...ui.input, height: '90px' }} required></textarea>
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

              <button type="submit" style={{ ...ui.primaryBtn, marginTop: '0.5rem' }} className="btn-hover">
                Kezdőlap Módosítások Mentése
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'news' && (
          <div>
            {user?.role === 'teacher' && (
              <div style={ui.glassCard} className="fade-in">
                <div style={ui.cardHeaderRow}>
                  <h3 style={ui.sectionTitle}><Megaphone size={18} color="#10b981"/> Új Hír Közzététele</h3>
                </div>
                <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>CÍM</label>
                    <input type="text" placeholder="Pl. Elmaradnak a pénteki órák" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TARTALOM</label>
                    <textarea placeholder="Leírás..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{...ui.input, height: '75px'}} required></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
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

                  <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={16}/> Hír Közzététele</button>
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
                        {Boolean(a.is_pinned) && <span style={ui.pinTag}><Pin size={11}/> FIXÁLT HÍR</span>}
                        <h4 style={ui.cardTitle}>{a.title}</h4>
                      </div>
                      {user?.role === 'teacher' && (
                        <button onClick={() => handleDeleteAnnouncement(a.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={15}/></button>
                      )}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>{a.content}</p>

                    {user?.role === 'student' && Boolean(a.is_applyable) && (
                      <button 
                        onClick={() => handleApplyToAnnouncement(a)} 
                        style={{ ...ui.primaryBtn, marginTop: '0.85rem', width: 'auto', padding: '0.5rem 1rem' }}
                        className="btn-hover"
                      >
                        <CheckCircle2 size={15}/> Jelentkezem az órára
                      </button>
                    )}

                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', borderTop: '1px solid #121f19', paddingTop: '0.6rem' }}>
                      <span>Szerző: <strong style={{ color: '#94a3b8' }}>{a.teacher_name || 'Tanár'}</strong></span>
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
              <div style={ui.glassCard} className="fade-in">
                <div style={ui.cardHeaderRow}>
                  <h3 style={ui.sectionTitle}><Users size={18} color="#10b981"/> Új Bemutatkozó Kártya Hozzáadása</h3>
                </div>
                <form onSubmit={handleCreateAboutUs} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                      style={{...ui.input, height: '85px'}} 
                      required
                    ></textarea>
                  </div>

                  <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={16}/> Kártya Hozzáadása</button>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <h4 style={{ color: '#10b981', margin: 0, fontSize: '0.95rem' }}>Névjegy Szerkesztése (#{item.id})</h4>
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
                              style={{ ...ui.input, height: '85px' }} 
                              required
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                            <button onClick={() => handleSaveEditAboutUs(item.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={15}/> Mentés</button>
                            <button onClick={() => setEditingAboutUsId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={15}/> Mégse</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <img 
                            src={imageUrl} 
                            alt={item.name} 
                            style={{ width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #1a2922' }} 
                          />
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={ui.cardHeaderRow}>
                              <h4 style={ui.cardTitle}>{item.name}</h4>
                              {user?.role === 'teacher' && (
                                <div>
                                  <button onClick={() => handleStartEditAboutUs(item)} style={ui.editBtn} className="btn-hover"><Edit size={15}/></button>
                                  <button onClick={() => handleDeleteAboutUs(item.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={15}/></button>
                                </div>
                              )}
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.description}</p>
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
              <div style={ui.highlightCard} className="fade-in">
                <div style={ui.cardHeaderRow}>
                  <span style={ui.badge}><Sparkles size={13}/> MAI ÓRÁD</span>
                  <span style={ui.timeTag}>
                    {new Date(todayLesson.start_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0.4rem 0' }}>{todayLesson.subject}</h3>
                <p style={ui.cardDesc}><BookOpen size={15}/> {todayLesson.topic || 'Tematika nincs megadva'}</p>
                {todayLesson.notes && <p style={{ ...ui.cardDesc, color: '#64748b' }}><FileText size={15}/> Megjegyzés: {todayLesson.notes}</p>}
                <p style={{ color: '#10b981', fontWeight: '700', marginTop: '0.5rem', fontSize: '0.9rem' }}>Óradíj: {todayLesson.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(todayLesson.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
              </div>
            ) : (
              <div style={ui.glassCard}>
                <p style={ui.emptyText}>Mai napon nincs kiírt órád.</p>
              </div>
            )}

            <h3 style={{ ...ui.sectionTitle, marginTop: '1.5rem' }}>Közelgő Óráim</h3>
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
                    <p style={ui.cardDesc}><BookOpen size={15}/> {l.topic || 'Tematika nincs megadva'}</p>
                    {l.notes && <p style={{ ...ui.cardDesc, color: '#64748b' }}><FileText size={15}/> Megjegyzés: {l.notes}</p>}
                    <p style={{ color: '#10b981', fontWeight: '700', marginTop: '0.5rem', fontSize: '0.875rem' }}>Díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
                  </div>
                ))
              )}
            </div>

            <h3 style={{ ...ui.sectionTitle, marginTop: '1.5rem' }}>Korábbi Óráim</h3>
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
                    <p style={ui.cardDesc}><BookOpen size={15}/> {l.topic || 'Tematika nincs megadva'}</p>
                    <p style={{ color: '#10b981', fontWeight: '700', marginTop: '0.5rem', fontSize: '0.875rem' }}>Díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === 'student' && activeTab === 'searchTeachers' && (
          <div>
            <h3 style={ui.sectionTitle}><Search size={18} color="#10b981"/> Tanárkereső & Szaktanárok</h3>
            
            <div style={{ marginBottom: '1.2rem' }}>
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
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>{t.full_name}</h4>
                        <span style={{ ...ui.badge, marginTop: '0.3rem' }}><BookOpen size={12}/> {t.subject || 'Szakos tanár'}</span>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#10b981' }}>
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
                        <MessageSquare size={15}/> Üzenet küldése
                      </button>
                    </div>
                    
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                      {t.bio || 'Nincs részletes bemutatkozás megadva.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #121f19', paddingTop: '0.6rem' }}>
                      {t.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13}/> {t.phone}</span>}
                      {t.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={13}/> {t.email}</span>}
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
              <div style={ui.glassCard} className="fade-in">
                <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.85rem' }}>{teacherInfo.full_name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}><Mail size={16} color="#10b981"/> <strong>E-mail:</strong> {teacherInfo.email}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}><Phone size={16} color="#10b981"/> <strong>Telefon:</strong> {teacherInfo.phone || 'Nincs megadva'}</p>
                  {teacherInfo.bio && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid #121f19', paddingTop: '0.6rem' }}>
                      <strong style={{ color: '#10b981', fontSize: '0.8rem' }}>BEMUTATKOZÁS:</strong>
                      <p style={{ color: '#64748b', marginTop: '0.25rem', lineHeight: '1.5', fontSize: '0.85rem' }}>{teacherInfo.bio}</p>
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
              <div style={ui.glassCard} className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <label style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>TANÁRI SZŰRŐ (ADMIN):</label>
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

            <div style={ui.glassCard} className="fade-in">
              <h3 style={ui.sectionTitle}><CalendarIcon size={18} color="#10b981"/> Órarendi Naptár Nézet</h3>
              <ScheduleView lessons={lessons} user={user} token={token} selectedTeacherId={selectedTeacherId} onDeleteLesson={handleDeleteLesson} />
            </div>

            <div style={ui.glassCard} className="fade-in">
              <h3 style={ui.sectionTitle}><Plus size={18} color="#10b981"/> Új Óra Kiírása</h3>
              <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
                    style={{ ...ui.input, height: '65px' }}
                  ></textarea>
                </div>

                <div style={{ background: '#050a08', padding: '0.85rem', borderRadius: '6px', border: '1px solid #1a2922', marginTop: '0.25rem' }}>
                  <label style={ui.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={newLesson.is_recurring} 
                      onChange={e => setNewLesson({...newLesson, is_recurring: e.target.checked})} 
                      style={ui.checkbox} 
                    />
                    <span style={{ fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Repeat size={15} /> Ismétlődő óra generálása (Hetente ugyanebben az időpontban)
                    </span>
                  </label>

                  {newLesson.is_recurring && (
                    <div style={{ ...ui.inputGroup, marginTop: '0.75rem' }}>
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
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        A megadott kezdési időponttól kezdve heti rendszerességgel jönnek létre az alkalmak.
                      </span>
                    </div>
                  )}
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={16}/> Óra Kiírása</button>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h4 style={{ color: '#10b981', margin: 0, fontSize: '0.95rem' }}>Óra Szerkesztése (#{l.id})</h4>
                        
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
                            style={{ ...ui.input, height: '55px' }} 
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

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button onClick={() => handleSaveEditLesson(l.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={15}/> Mentés</button>
                          <button onClick={() => setEditingLessonId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={15}/> Mégse</button>
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
                            <button onClick={() => handleStartEditLesson(l)} style={ui.editBtn} className="btn-hover"><Edit size={15}/></button>
                            <button onClick={() => handleDeleteLesson(l.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={15}/></button>
                          </div>
                        </div>

                        <p style={ui.cardDesc}><BookOpen size={15}/> {l.topic || 'Nincs leírás'}</p>
                        {l.notes && <p style={{ ...ui.cardDesc, color: '#64748b' }}><FileText size={15}/> Megjegyzés: {l.notes}</p>}
                        
                        <p style={{ color: '#10b981', fontWeight: '700', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                          Beállított díj: {l.payment_status === 'settled' ? '0 Ft (Rendezve)' : `${(l.calculated_price || 0).toLocaleString('hu-HU')} Ft`}
                        </p>

                        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', borderTop: '1px solid #121f19', paddingTop: '0.6rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', letterSpacing: '0.5px' }}>FIZETÉSI STÁTUSZ:</span>
                          <select 
                            value={l.payment_status || (l.is_paid ? 'cash' : 'unpaid')} 
                            onChange={e => handlePaymentChange(l.id, e.target.value)}
                            style={{
                              ...ui.input,
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              background: l.payment_status === 'settled' ? 'rgba(59, 130, 246, 0.15)' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                              borderColor: l.payment_status === 'settled' ? '#3b82f6' : (l.is_paid || l.payment_status === 'cash' || l.payment_status === 'transfer' ? '#10b981' : '#ef4444'),
                              color: '#ffffff'
                            }}
                          >
                            <option value="unpaid" style={{ background: '#09120e' }}>❌ Kifizetetlen</option>
                            <option value="cash" style={{ background: '#09120e' }}>💵 Készpénz</option>
                            <option value="transfer" style={{ background: '#09120e' }}>🏦 Átutalás</option>
                            <option value="settled" style={{ background: '#09120e' }}>🤝 Rendezve (0 Ft / Jutalék mentes)</option>
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
          <div id="printable-earnings-section" style={ui.glassCard} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ ...ui.sectionTitle, margin: 0 }}><Calculator size={20} color="#10b981"/> Kereset Kimutatás</h3>
              <button onClick={() => window.print()} style={ui.primaryBtnInline} className="btn-hover no-print"><Printer size={15}/> Nyomtatás / PDF</button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {(user?.is_admin || user?.id === 1) 
                ? (selectedTeacherId 
                    ? 'A kiválasztott tanár óráiból befolyt bruttó összeg, a levont jutalék (50 perc: 1.500 Ft, 100 perc: 2.000 Ft), valamint a tanár által kézhez kapandó nettó kereset.' 
                    : 'Az alábbiakban láthatod a saját óráidból befolyt bruttó összeget, a más tanárok után kapott jutalékot (50 perc: 1.500 Ft, 100 perc: 2.000 Ft), valamint a teljes nettó keresetedet.') 
                : 'Az alábbiakban láthatod a beállított óradíjaid alapján befolyt bruttó összeget, a rendszerhasználati díjat (50 perces óránként 1.500 Ft, 100 perces óránként 2.000 Ft), valamint a levonás utáni végleges nettó keresetedet.'}
            </p>

            {(user?.is_admin || user?.id === 1) && (
              <div className="no-print" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <label style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>TANÁRI SZŰRŐ (ADMIN):</label>
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

            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem', background: '#050a08', padding: '1rem', borderRadius: '6px', border: '1px solid #1a2922' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#091510', padding: '1.1rem', borderRadius: '6px', border: '1px solid #1a2922' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#60a5fa', letterSpacing: '0.5px' }}>
                    {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'TANÁR BEFOLYT BRUTTÓ ÖSSZEG' : 'SAJÁT ÓRÁK (BRUTTÓ)') : 'BEFOLYT BRUTTÓ ÖSSZEG'}
                  </span>
                  <DollarSign size={18} color="#60a5fa"/>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: '0.4rem 0 0.1rem 0' }}>
                  {teacherEarningsData.totalGross.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'A kiválasztott tanár megtartott órái' : 'Saját megtartott óráid díja') : 'Diákok által fizetett összeg'}
                </span>
              </div>

              <div style={{ background: '#091510', padding: '1.1rem', borderRadius: '6px', border: '1px solid #1a2922' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#f87171', letterSpacing: '0.5px' }}>
                    {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? 'LEVONT JUTALÉK' : 'KAPOTT JUTALÉK (MÁS TANÁROK)') : 'LEVONT JUTALÉK (KORNYA.KMS)'}
                  </span>
                  <TrendingUp size={18} color="#f87171"/>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: '0.4rem 0 0.1rem 0' }}>
                  {(user?.is_admin || user?.id === 1) ? (selectedTeacherId ? '-' : '+') : '-'}{teacherEarningsData.totalCommission.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>50p: {teacherEarningsData.count50}x1500 Ft | 100p: {teacherEarningsData.count100}x2000 Ft</span>
              </div>

              <div style={{ background: '#0d1d16', padding: '1.1rem', borderRadius: '6px', border: '1px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.5px' }}>VÉGLEGES NETTÓ KERESET</span>
                  <CheckCircle2 size={18} color="#10b981"/>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', margin: '0.4rem 0 0.1rem 0' }}>
                  {teacherEarningsData.netEarnings.toLocaleString('hu-HU')} Ft
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Végső elszámolható egyenleg</span>
              </div>
            </div>

            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: '700' }}>Részletezett Óralista az Időszakban</h4>
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
                      <td style={{ ...ui.td, color: '#10b981', fontWeight: '700' }}>{item.net.toLocaleString('hu-HU')} Ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {user?.role === 'teacher' && activeTab === 'students' && (
          <div>
            <div style={ui.glassCard} className="fade-in">
              <h3 style={ui.sectionTitle}><GraduationCap size={18} color="#10b981"/> Új Diák Regisztrálása</h3>
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" placeholder="Kovács Péter" value={newStudent.full_name} onChange={e => setNewStudent({...newStudent, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" placeholder="peter@diak.hu" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" placeholder="••••••••" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>ISKOLA</label>
                    <input type="text" placeholder="Gimnázium neve" value={newStudent.school} onChange={e => setNewStudent({...newStudent, school: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>OSZTÁLY / ÉVFOLYAM</label>
                    <input type="text" placeholder="11.B" value={newStudent.class_name} onChange={e => setNewStudent({...newStudent, class_name: e.target.value})} style={ui.input} />
                  </div>
                </div>

                <div style={ui.inputGroup}>
                  <label style={ui.label}>MEGJEGYZÉS</label>
                  <textarea placeholder="Diákkal kapcsolatos feljegyzések..." value={newStudent.notes} onChange={e => setNewStudent({...newStudent, notes: e.target.value})} style={{ ...ui.input, height: '55px' }}></textarea>
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={16}/> Diák Létrehozása</button>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h4 style={{ color: '#10b981', margin: 0, fontSize: '0.95rem' }}>Diák Adatainak Szerkesztése (#{s.id})</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                            style={{ ...ui.input, height: '55px' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button onClick={() => handleSaveEditStudent(s.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={15}/> Mentés</button>
                          <button onClick={() => setEditingStudentId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={15}/> Mégse</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={ui.cardHeaderRow}>
                          <div>
                            <h4 style={ui.cardTitle}>{s.full_name}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</span>
                          </div>
                          <div>
                            <button onClick={() => handleStartEditStudent(s)} style={ui.editBtn} className="btn-hover"><Edit size={15}/></button>
                            <button onClick={() => handleDeleteStudent(s.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={15}/></button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                          {s.school && <span>Iskola: <strong style={{ color: '#ffffff' }}>{s.school}</strong></span>}
                          {(s.class_name || s.student_class) && <span>Osztály: <strong style={{ color: '#ffffff' }}>{s.class_name || s.student_class}</strong></span>}
                        </div>

                        {s.notes && (
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', borderTop: '1px solid #121f19', paddingTop: '0.4rem' }}>
                            Megjegyzés: {s.notes}
                          </p>
                        )}
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
            <div style={ui.glassCard} className="fade-in">
              <h3 style={ui.sectionTitle}><ShieldCheck size={18} color="#10b981"/> Új Tanár Hozzáadása (Admin)</h3>
              <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELJES NÉV</label>
                    <input type="text" placeholder="Nagy István" value={newTeacher.full_name} onChange={e => setNewTeacher({...newTeacher, full_name: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>E-MAIL CÍM</label>
                    <input type="email" placeholder="istvan@oktatas.hu" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>JELSZÓ</label>
                    <input type="password" placeholder="••••••••" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} style={ui.input} required />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>TELEFON</label>
                    <input type="text" placeholder="+36 30 123 4567" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} style={ui.input} />
                  </div>
                  <div style={ui.inputGroup}>
                    <label style={ui.label}>SZAK / TANTÁRGY</label>
                    <input type="text" placeholder="Matematika" value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} style={ui.input} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
                  <label style={ui.label}>BEMUTATKOZÓ SZÖVEG</label>
                  <textarea placeholder="Rövid leírás..." value={newTeacher.bio} onChange={e => setNewTeacher({...newTeacher, bio: e.target.value})} style={{ ...ui.input, height: '55px' }}></textarea>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={ui.checkboxLabel}>
                    <input type="checkbox" checked={newTeacher.is_admin} onChange={e => setNewTeacher({...newTeacher, is_admin: e.target.checked})} style={ui.checkbox} />
                    <span>Adminisztrátori jogosultság megadása</span>
                  </label>
                </div>

                <button type="submit" style={ui.primaryBtn} className="btn-hover"><Plus size={16}/> Tanár Létrehozása</button>
              </form>
            </div>

            <h3 style={ui.sectionTitle}>Rendszerben Lévő Tanárok</h3>
            <div style={ui.gridGap}>
              {teachers.map(t => (
                <div key={t.id} style={ui.glassCard} className="card-hover">
                  {editingTeacherId === t.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ color: '#10b981', margin: 0, fontSize: '0.95rem' }}>Tanár Szerkesztése (#{t.id})</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>TELJES NÉV</label>
                          <input type="text" value={editTeacherData.full_name} onChange={e => setEditTeacherData({ ...editTeacherData, full_name: e.target.value })} style={ui.input} required />
                        </div>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>E-MAIL CÍM</label>
                          <input type="email" value={editTeacherData.email} onChange={e => setEditTeacherData({ ...editTeacherData, email: e.target.value })} style={ui.input} required />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>TELEFON</label>
                          <input type="text" value={editTeacherData.phone} onChange={e => setEditTeacherData({ ...editTeacherData, phone: e.target.value })} style={ui.input} />
                        </div>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>SZAK / TANTÁRGY</label>
                          <input type="text" value={editTeacherData.subject} onChange={e => setEditTeacherData({ ...editTeacherData, subject: e.target.value })} style={ui.input} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.2rem' }}>
                          <label style={ui.checkboxLabel}>
                            <input type="checkbox" checked={editTeacherData.is_admin} onChange={e => setEditTeacherData({ ...editTeacherData, is_admin: e.target.checked })} style={ui.checkbox} />
                            <span>Admin joga</span>
                          </label>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>50 PERCES ÓRADÍJ (FT)</label>
                          <input type="number" value={editTeacherData.hourly_rate_50} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_50: parseInt(e.target.value) || 0 })} style={ui.input} />
                        </div>
                        <div style={ui.inputGroup}>
                          <label style={ui.label}>100 PERCES ÓRADÍJ (FT)</label>
                          <input type="number" value={editTeacherData.hourly_rate_100} onChange={e => setEditTeacherData({ ...editTeacherData, hourly_rate_100: parseInt(e.target.value) || 0 })} style={ui.input} />
                        </div>
                      </div>

                      <div style={ui.inputGroup}>
                        <label style={ui.label}>BEMUTATKOZÁS</label>
                        <textarea value={editTeacherData.bio} onChange={e => setEditTeacherData({ ...editTeacherData, bio: e.target.value })} style={{ ...ui.input, height: '55px' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button onClick={() => handleSaveEditTeacher(t.id)} style={ui.primaryBtnInline} className="btn-hover"><Save size={15}/> Mentés</button>
                        <button onClick={() => setEditingTeacherId(null)} style={ui.secondaryBtnInline} className="btn-hover"><X size={15}/> Mégse</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={ui.cardHeaderRow}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={ui.cardTitle}>{t.full_name}</h4>
                            {Boolean(t.is_admin) && <span style={{ ...ui.badge, background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.25)' }}>ADMIN</span>}
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.email}</span>
                        </div>
                        <div>
                          <button onClick={() => handleStartEditTeacher(t)} style={ui.editBtn} className="btn-hover"><Edit size={15}/></button>
                          <button onClick={() => handleDeleteTeacher(t.id)} style={ui.deleteBtn} className="btn-hover"><Trash2 size={15}/></button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <span>Szak: <strong style={{ color: '#ffffff' }}>{t.subject || 'Nincs megadva'}</strong></span>
                        <span>50p díj: <strong style={{ color: '#10b981' }}>{t.hourly_rate_50 || 5000} Ft</strong></span>
                        <span>100p díj: <strong style={{ color: '#10b981' }}>{t.hourly_rate_100 || 9000} Ft</strong></span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', minHeight: '520px' }}>
            <div style={ui.glassCard}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981', marginBottom: '0.85rem', letterSpacing: '0.5px' }}>BESZÉLGETÉSEK</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {conversations.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>Nincsenek elérhető elbeszélgetések.</p>
                ) : (
                  conversations.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setSelectedUser(c)} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: selectedUser?.id === c.id ? '#10b981' : '#121f19',
                        background: selectedUser?.id === c.id ? 'rgba(16, 185, 129, 0.1)' : '#060b09',
                        color: '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      className="btn-hover"
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.role === 'teacher' ? 'Tanár' : 'Diák'}</div>
                      </div>
                      <ChevronRight size={14} color={selectedUser?.id === c.id ? '#10b981' : '#475569'} />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...ui.glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {selectedUser ? (
                <>
                  <div>
                    <div style={{ borderBottom: '1px solid #1a2922', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={18} color="#10b981"/>
                      <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.95rem', fontWeight: '700' }}>{selectedUser.full_name}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {messages.length === 0 ? (
                        <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', margin: '2rem 0' }}>Még nincs üzenetváltás ebben a beszélgetésben.</p>
                      ) : (
                        messages.map(m => {
                          const isOwn = Number(m.sender_id) === Number(user?.id);
                          return (
                            <div 
                              key={m.id} 
                              style={{
                                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                background: isOwn ? '#0d1d16' : '#060b09',
                                border: '1px solid',
                                borderColor: isOwn ? '#10b981' : '#1a2922',
                                padding: '0.6rem 0.85rem',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '0.85rem'
                              }}
                            >
                              <p style={{ margin: 0, lineHeight: '1.4' }}>{m.content}</p>
                              {m.file_url && (
                                <a 
                                  href={m.file_url.startsWith('http') ? m.file_url : `${UPLOADS_BASE}${m.file_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontSize: '0.75rem', marginTop: '0.4rem', textDecoration: 'none' }}
                                >
                                  <Paperclip size={12}/> CSATOLMÁNY LETÖLTÉSE
                                </a>
                              )}
                              <span style={{ display: 'block', fontSize: '0.65rem', color: '#475569', marginTop: '0.25rem', textAlign: 'right' }}>
                                {new Date(m.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} style={{ marginTop: '1rem', borderTop: '1px solid #1a2922', paddingTop: '0.85rem' }}>
                    {selectedFile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981', marginBottom: '0.4rem' }}>
                        <Paperclip size={12}/> Kiválasztva: {selectedFile.name} 
                        <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Írj üzenetet..." 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        style={{ ...ui.input, flex: 1 }} 
                      />
                      <label style={{ ...ui.secondaryBtnInline, cursor: 'pointer', padding: '0.55rem 0.8rem' }}>
                        <Paperclip size={15}/>
                        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ display: 'none' }} />
                      </label>
                      <button type="submit" style={ui.primaryBtnInline} className="btn-hover"><Send size={15}/></button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: '0.85rem' }}>
                  Válassz ki egy beszélgetést a bal oldali sávból!
                </div>
              )}
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