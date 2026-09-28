import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
LayoutDashboard, ReceiptText, WalletCards, BarChart3, Lightbulb, Sparkles,
Settings as SettingsIcon, LogOut, Menu, X, Moon, Sun, Bell, UserRound, ShieldCheck,
  Plus, Trash2, Edit3, ArrowUpRight, ArrowDownRight, RefreshCw, Download,
  Search, CircleDollarSign, PiggyBank, Target, ChevronRight, CheckCircle2,
  AlertTriangle, Info, Users, Tags, Megaphone, Upload, FileSpreadsheet, KeyRound, Mail,
  LockKeyhole, RotateCcw, Bookmark, UserRoundCheck, Database, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useNotification } from './context/NotificationContext';
import authService from './services/authService';
import transactionService from './services/transactionService';
import categoryService from './services/categoryService';
import budgetService from './services/budgetService';
import reportService from './services/reportService';
import tipService from './services/tipService';
import insightService from './services/insightService';
import adminService from './services/adminService';
import csvService from './services/csvService';
import bookmarkService from './services/bookmarkService';

const money = (n, currency='$') => `${currency}${Number(n || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const monthNow = () => new Date().toISOString().slice(0,7);

function ErrorBox({message}) { return message ? <div className="alert alert-error"><AlertTriangle size={17}/><span>{message}</span></div> : null; }
function Empty({text='No records yet.'}) { return <div className="empty-inline"><Info size={18}/><span>{text}</span></div>; }

function PublicLayout({children}) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const publicLinks = [['/','Home'],['/about','About'],['/features','Features'],['/contact','Contact']];
  const doLogout = () => { logout(); navigate('/login'); };
  return <div className="public-shell">
    <div className="public-announcement"><span className="status-dot"/> Campus Coin • Student finance, reimagined <span>Built for modern campus communities</span></div>
    <header className="public-nav">
      <div className="public-nav-inner">
        <Link to="/" className="brand public-brand"><span className="brand-mark">₿</span><span className="brand-wordmark">Campus <b>Coin</b></span></Link>
        <nav className="public-links" aria-label="Primary navigation">{publicLinks.map(([to,label])=><NavLink key={to} to={to} end={to==='/' } className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}</nav>
        <div className="nav-actions">
          <button className="icon-btn nav-theme" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
          {!isAuthenticated ? <><Link className="btn btn-secondary nav-admin" to="/admin/login"><ShieldCheck size={16}/> Admin</Link><Link className="btn btn-secondary nav-login" to="/login">Sign in</Link><Link className="btn btn-primary nav-cta" to="/register">Get started <ArrowUpRight size={16}/></Link></> : <><Link className="nav-portal" to={role==='admin'?'/admin/dashboard':'/dashboard'}><span className="avatar sm">{role==='admin'?<ShieldCheck size={15}/>:((user?.name||'U').slice(0,1).toUpperCase())}</span><span className="nav-portal-text">{role==='admin'?'Admin Center':'My Dashboard'}</span></Link><button className="btn btn-secondary nav-signout" onClick={doLogout}><LogOut size={16}/> Sign out</button></>}
        </div>
      </div>
    </header>
    {children}
  </div>;
}

function Landing() {
  const { theme, toggleTheme } = useTheme();
  const features=[
    [ReceiptText,'Track every expense','Log income, spending and recurring payments in seconds.'],
    [WalletCards,'Build smarter budgets','Set category limits and understand where your money goes.'],
    [BarChart3,'Visualize your progress','Clear reports, trends and monthly financial snapshots.'],
    [Sparkles,'Get useful insights','Personalized tips help you build healthier money habits.']
  ];
  return <PublicLayout>
    <section className="hero public-hero" id="home">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={15}/> Built for student life</span>
        <h1>Make every rupee<br/><span>work for your future.</span></h1>
        <p>Campus Coin is a modern student finance platform for tracking expenses, planning budgets, monitoring savings and understanding your financial habits.</p>
        <div className="hero-actions"><Link to="/register" className="btn btn-primary btn-lg">Start for free <ArrowUpRight size={18}/></Link><a href="#features" className="btn btn-secondary btn-lg">Explore features</a></div>
        <div className="trust-row"><span>✓ Student-focused</span><span>✓ Secure accounts</span><span>✓ Simple analytics</span></div>
      </div>
      <div className="hero-card glass-hero">
        <div className="mini-top"><span>Campus Coin overview</span><span className="badge badge-income">On track</span></div>
        <div className="mini-balance">$1,248.50</div><div className="mini-label">Available balance</div>
        <div className="mini-bars"><i style={{height:'42%'}}/><i style={{height:'65%'}}/><i style={{height:'50%'}}/><i style={{height:'82%'}}/><i style={{height:'58%'}}/><i style={{height:'92%'}}/></div>
        <div className="mini-stats"><span><b>Income</b><strong className="income-text">+$2,000</strong></span><span><b>Expenses</b><strong className="expense-text">-$751.50</strong></span></div>
        <div className="floating-chip"><CheckCircle2 size={16}/> Budget under control</div>
      </div>
    </section>
    <section className="public-section" id="features"><div className="section-heading"><span className="eyebrow">Everything in one place</span><h2>Finance tools that fit campus life</h2><p>From your first transaction to your monthly report, Campus Coin keeps your money organized.</p></div><div className="feature-grid content-body">{features.map(([I,t,d])=><div className="feature card reveal-card" key={t}><div className="feature-icon"><I size={22}/></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section className="public-section alt-section" id="about"><div className="about-grid"><div><span className="eyebrow">About Campus Coin</span><h2>A calmer way to manage student money.</h2><p>Campus Coin brings everyday money management into one focused workspace. Students can record transactions, set budgets, review reports, import CSV data and receive financial guidance without juggling multiple tools.</p><div className="about-points"><span><CheckCircle2 size={17}/> Fast transaction tracking</span><span><CheckCircle2 size={17}/> Clear monthly reporting</span><span><CheckCircle2 size={17}/> Smart recurring expenses</span><span><CheckCircle2 size={17}/> Helpful saving tips</span></div></div><div className="about-panel card"><div className="about-orb"><PiggyBank size={34}/></div><h3>Designed around your goals</h3><p>Know what came in, what went out and what you can save next.</p><Link to="/register" className="text-link">Create your account <ArrowUpRight size={15}/></Link></div></div></section>
    <section className="public-section" id="faq"><div className="section-heading"><span className="eyebrow">FAQ</span><h2>Questions, answered.</h2></div><div className="faq-grid"><details className="card"><summary>Is Campus Coin only for students?</summary><p>Yes. The experience is designed around student income, allowances, budgets and everyday expenses.</p></details><details className="card"><summary>Can I import my existing transactions?</summary><p>Yes. The student portal includes CSV preview, validation and import support.</p></details><details className="card"><summary>Does it support recurring transactions?</summary><p>Yes. Recurring expenses and income can be configured with daily, weekly, monthly or yearly frequency.</p></details><details className="card"><summary>Can I use dark mode?</summary><p>Yes. The application includes light/dark themes and adjustable text size.</p></details></div></section>
    <section className="public-section contact-section" id="contact"><div className="contact-card card"><div><span className="eyebrow">Contact</span><h2>Have a question?</h2><p>We would love to hear from you. Send a message and our team can follow up.</p><div className="contact-info"><span><Mail size={18}/> support@campuscoin.app</span><span><ShieldCheck size={18}/> Student-first platform</span></div></div><form onSubmit={e=>{e.preventDefault();alert('Thanks! Your message has been received.')}}><input className="form-control" required placeholder="Your name" pattern="[A-Za-zÀ-ÖØ-öø-ÿ '-]+" title="Name may contain letters, spaces, apostrophes and hyphens only." onChange={e=>e.target.value=cleanPersonName(e.target.value)}/><input className="form-control" type="email" required placeholder="Your email"/><textarea className="form-control" required rows="4" placeholder="How can we help?"/><button className="btn btn-primary">Send message <ArrowUpRight size={17}/></button></form></div></section>
    <footer className="public-footer"><div className="footer-brand"><span className="brand-mark">₿</span><span>Campus <b>Coin</b></span></div><div className="footer-links"><a href="#home">Home</a><a href="#about">About</a><a href="#features">Features</a><a href="#faq">FAQ</a><a href="#contact">Contact</a><Link to="/admin/login">Admin</Link></div><small>© 2026 Campus Coin. Built for smarter student finances.</small></footer>
  </PublicLayout>;
}

function PublicInfoPage({type}){
  const data={
    about:{eyebrow:'About Campus Coin',title:'A financial companion made for student life.',text:'Campus Coin gives students one focused place to record spending, plan budgets, understand trends and build better saving habits.',items:['Student-first experience','Simple income and expense tracking','Budgets, reports and savings goals','Recurring transactions and CSV import','Helpful tips and personalized insights']},
    features:{eyebrow:'Features',title:'Everything you need to understand your money.',text:'A complete toolkit for everyday student finance, from a quick expense entry to a detailed monthly report.',items:['Dashboard overview','Transactions and categories','Monthly budgets','Reports and analytics','CSV import and validation','Recurring transactions','Saving tips and AI insights','Bookmarks and notifications']},
    faq:{eyebrow:'FAQ',title:'Common questions about Campus Coin.',text:'Here are a few quick answers before you get started.',items:['Campus Coin is designed specifically for students.','You can import existing transactions through CSV.','Recurring transactions can be scheduled.','Light and dark themes are supported.','Admin access is protected separately from student access.']}
  }[type];
  return <PublicLayout><section className="info-page public-section"><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p className="info-lead">{data.text}</p><div className="info-cards">{data.items.map((x,i)=><div className="card info-card" key={x}><span className="info-number">0{i+1}</span><div><h3>{x}</h3><p>{type==='faq'?'Designed to keep the student experience simple, clear and useful.':'Built into the Campus Coin experience so you can manage your finances without switching between tools.'}</p></div></div>)}</div><Link to="/register" className="btn btn-primary btn-lg">Get started <ArrowUpRight size={18}/></Link></section><footer className="public-footer"><div className="footer-brand"><span className="brand-mark">₿</span><span>Campus <b>Coin</b></span></div><div className="footer-links"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/features">Features</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link></div></footer></PublicLayout>;
}
function ContactPage(){return <PublicLayout><section className="public-section contact-page"><div className="section-heading"><span className="eyebrow">Contact us</span><h1>Let's talk about Campus Coin.</h1><p>Have feedback, a question or a campus partnership idea? Send us a message.</p></div><div className="contact-card card"><div><h2>We're here to help.</h2><p>For general questions, use the form. You can also reach the Campus Coin team through the support address below.</p><div className="contact-info"><span><Mail size={18}/> support@campuscoin.app</span><span><ShieldCheck size={18}/> Secure student platform</span><span><Megaphone size={18}/> Feedback is welcome</span></div></div><form onSubmit={e=>{e.preventDefault();alert('Thanks! Your message has been received.')}}><input className="form-control" required placeholder="Your name" pattern="[A-Za-zÀ-ÖØ-öø-ÿ '-]+" title="Name may contain letters, spaces, apostrophes and hyphens only." onChange={e=>e.target.value=cleanPersonName(e.target.value)}/><input className="form-control" type="email" required placeholder="Your email"/><input className="form-control" placeholder="Subject"/><textarea className="form-control" required rows="5" placeholder="Your message"></textarea><button className="btn btn-primary">Send message <ArrowUpRight size={17}/></button></form></div></section></PublicLayout>}

function AdminLogin(){
  const {login,logout,loading}=useAuth(); const navigate=useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState('');
  const submit=async e=>{e.preventDefault();setError('');try{const r=await login({email,password});if(r.user?.role!=='admin'){logout();setError('This portal is restricted to administrators.');return;}navigate('/admin/dashboard');}catch(err){setError(err.message||'Invalid admin credentials.')}};
  return <div className="admin-login-page"><div className="admin-login-glow one"/><div className="admin-login-glow two"/><div className="admin-login-card"><Link to="/" className="admin-brand"><span className="brand-mark">₿</span><div><b>Campus Coin</b><small>Administration Portal</small></div></Link><div className="admin-login-head"><span className="admin-shield"><ShieldCheck size={27}/></span><h1>Admin Control Center</h1><p>Secure access for Campus Coin administrators.</p></div>{error&&<ErrorBox message={error}/>}<form onSubmit={submit}><div className="form-group"><label className="form-label">Admin email</label><input className="form-control" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@gmail.com"/></div><div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter admin password"/></div><button className="btn btn-primary btn-block" disabled={loading}><ShieldCheck size={17}/>{loading?'Authenticating…':'Enter admin dashboard'}</button></form><Link className="admin-back" to="/">← Back to website</Link></div></div>;
}

const cleanPersonName = value => value.replace(/[^\p{L}\p{M}' -]/gu, '').replace(/\s{2,}/g, ' ');

function AuthPage({mode='login'}) {
  const isLogin=mode==='login'; const navigate=useNavigate(); const {login,register,loading}=useAuth();
  const [form,setForm]=useState(isLogin?{email:'',password:''}:{name:'',email:'',password:'',academicYear:'1st Year',monthlyAllowanceBaseline:'',monthlySavingsGoal:'',currency:'$'});
  const [error,setError]=useState(''); const [ok,setOk]=useState('');
  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{e.preventDefault();setError('');setOk('');try{
    if(isLogin) await login(form); else await register({...form,monthlyAllowanceBaseline:Number(form.monthlyAllowanceBaseline)||0,monthlySavingsGoal:Number(form.monthlySavingsGoal)||0});
    navigate('/dashboard');
  }catch(err){setError(err.message||'Something went wrong.');}};
  return <PublicLayout><div className="auth-wrap"><div className="auth-card card">
    <div className="auth-head"><span className="brand-mark large">₿</span><h1>{isLogin?'Welcome back':'Build your student money hub'}</h1><p>{isLogin?'Sign in to continue to Campus Coin.':'Create your Campus Coin account in under a minute.'}</p></div>
    <ErrorBox message={error}/>{ok&&<div className="alert alert-success"><CheckCircle2 size={17}/>{ok}</div>}
    <form onSubmit={submit}>
      {!isLogin&&<div className="form-group"><label className="form-label">Full name</label><input className="form-control" name="name" required value={form.name} onChange={e=>setForm({...form,name:cleanPersonName(e.target.value)})} pattern="[A-Za-zÀ-ÖØ-öø-ÿ '-]+" title="Name may contain letters, spaces, apostrophes and hyphens only." placeholder="Your name"/></div>}
      <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" name="email" required value={form.email} onChange={update} placeholder="student@example.com"/></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" name="password" required minLength="6" value={form.password} onChange={update} placeholder="Minimum 6 characters"/></div>
      {!isLogin&&<><div className="form-grid"><div className="form-group"><label className="form-label">Academic year</label><select className="form-control" name="academicYear" value={form.academicYear} onChange={update}>{['1st Year','2nd Year','3rd Year','4th Year','Graduate','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div className="form-group"><label className="form-label">Currency</label><select className="form-control" name="currency" value={form.currency} onChange={update}><option>$</option><option>PKR</option><option>€</option><option>£</option></select></div></div><div className="form-grid"><div className="form-group"><label className="form-label">Monthly allowance</label><input className="form-control" type="number" min="0" name="monthlyAllowanceBaseline" value={form.monthlyAllowanceBaseline} onChange={update}/></div><div className="form-group"><label className="form-label">Savings goal</label><input className="form-control" type="number" min="0" name="monthlySavingsGoal" value={form.monthlySavingsGoal} onChange={update}/></div></div></>}
      <button className="btn btn-primary btn-block" disabled={loading}>{loading?'Please wait…':isLogin?'Sign in':'Create account'}</button>
    </form>
    {isLogin?<><p className="auth-switch">Forgot your password? <Link to="/forgot-password">Reset it</Link></p><p className="auth-switch">New here? <Link to="/register">Create an account</Link></p></>:<p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>}
  </div></div></PublicLayout>;
}


function ForgotPassword(){
  const [email,setEmail]=useState(''); const [error,setError]=useState(''); const [ok,setOk]=useState(''); const [devPin,setDevPin]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setError('');setOk('');setDevPin('');setBusy(true);try{const r=await authService.forgotPassword(email);setOk(r.message||'A password reset PIN has been sent to your email.');if(r.resetPin)setDevPin(r.resetPin);navigate(`/reset-password?email=${encodeURIComponent(email)}`);}catch(err){setError(err.message||'Unable to send reset PIN.')}finally{setBusy(false)}};
  return <PublicLayout><div className="auth-wrap"><div className="auth-card card"><div className="auth-head"><span className="brand-mark large">₿</span><h1>Forgot your password?</h1><p>Enter your registered email and we'll send a 6-digit PIN to your inbox.</p></div><ErrorBox message={error}/>{ok&&<div className="alert alert-success"><CheckCircle2 size={17}/><span>{ok}</span></div>}<form onSubmit={submit}><div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/></div><button className="btn btn-primary btn-block" disabled={busy}><Mail size={17}/>{busy?'Sending PIN…':'Send PIN to my email'}</button></form>{devPin&&<div className="card" style={{marginTop:16,padding:16}}><b>Development PIN</b><p className="muted">SMTP is not configured, so this demo PIN is shown locally.</p><strong style={{fontSize:24,letterSpacing:6}}>{devPin}</strong></div>}<p className="auth-switch"><Link to="/login">Back to login</Link></p></div></div></PublicLayout>;
}

function ResetPassword(){
  const location=useLocation(); const pathToken=location.pathname.split('/').filter(Boolean).pop()||''; const isLinkToken=pathToken!=='reset-password'; const params=new URLSearchParams(location.search); const [email,setEmail]=useState(params.get('email')||''); const [pin,setPin]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [error,setError]=useState(''); const [ok,setOk]=useState(''); const [busy,setBusy]=useState(false); const [show,setShow]=useState(false); const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setError('');if(!isLinkToken&&(!email||!/^[0-9]{6}$/.test(pin)))return setError('Please enter the 6-digit PIN sent to your email.');if(password.length<6)return setError('Password must be at least 6 characters.');if(password!==confirm)return setError('Passwords do not match.');setBusy(true);try{const apiBase=import.meta.env.VITE_API_URL||'http://localhost:5000/api';const response=await fetch(`${apiBase}/auth/reset-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(isLinkToken?{token:pathToken,password}:{email,pin,password})});const data=await response.json();if(!response.ok) throw new Error(data.message||'Unable to reset password.');setOk(data.message||'Password reset successfully.');setTimeout(()=>navigate('/login'),1000);}catch(err){setError(err.message||'Unable to reset password.')}finally{setBusy(false)}};
  return <PublicLayout><div className="auth-wrap"><div className="auth-card card"><div className="auth-head"><span className="brand-mark large">₿</span><h1>Create a new password</h1><p>{isLinkToken?'Use the secure reset link to choose a new password.':'Enter the 6-digit PIN from your email, then choose a new password.'}</p></div><ErrorBox message={error}/>{ok&&<div className="alert alert-success"><CheckCircle2 size={17}/><span>{ok}</span></div>}<form onSubmit={submit}>{!isLinkToken&&<><div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/></div><div className="form-group"><label className="form-label">6-digit PIN</label><input className="form-control" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" required value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456"/></div></>}<div className="form-group"><label className="form-label">New password</label><div className="searchbox"><LockKeyhole size={17}/><input className="form-control" style={{border:0,boxShadow:'none'}} type={show?'text':'password'} minLength="6" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters"/><button type="button" className="icon-btn" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div><div className="form-group"><label className="form-label">Confirm password</label><input className="form-control" type={show?'text':'password'} minLength="6" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password"/></div><button className="btn btn-primary btn-block" disabled={busy}><KeyRound size={17}/>{busy?'Saving…':'Change password'}</button></form><p className="auth-switch"><Link to="/login">Back to login</Link></p></div></div></PublicLayout>;
}

function PublicOnly({children}) {
  const {isAuthenticated, role}=useAuth();
  if(isAuthenticated) return <Navigate to={role==='admin'?'/admin/dashboard':'/dashboard'} replace/>;
  return children;
}

function Protected({children,admin=false}) {
  const {isAuthenticated,role}=useAuth();
  if(!isAuthenticated) return <Navigate to={admin?'/admin/login':'/login'} replace/>;
  if(admin && role!=='admin') return <Navigate to="/admin/login" replace/>;
  if(!admin && role==='admin') return <Navigate to="/admin/dashboard" replace/>;
  return children;
}

const navItems=[
  ['/dashboard','Dashboard',LayoutDashboard],
  ['/transactions','Transactions',ReceiptText],
  ['/import','Import CSV',FileSpreadsheet],
  ['/categories','Categories',Tags],
  ['/budgets','Budgets',WalletCards],
  ['/reports','Reports',BarChart3],
  ['/tips','Saving Tips',Lightbulb],
  ['/insights','AI Insights',Sparkles],
  ['/bookmarks','Bookmarks',Bookmark],
  ['/settings','Settings',SettingsIcon]
];


function AppShell({children}) {
  const {user,logout,role}=useAuth(); const {theme,toggleTheme,fontSize,setFontSize}=useTheme(); const {unreadCount}=useNotification(); const [open,setOpen]=useState(false); const location=useLocation(); const navigate=useNavigate();
  const title=navItems.find(x=>x[0]===location.pathname)?.[1] || (location.pathname==='/admin'?'Admin Panel':'Campus Coin');
  const doLogout=()=>{logout();navigate('/login')};
  return <div className="app-container">
    <aside className={`sidebar ${open?'open':''}`}><div className="sidebar-brand"><Link to="/dashboard" className="brand"><span className="brand-mark">₿</span><span>Campus <b>Coin</b></span></Link><button className="icon-btn mobile-only" onClick={()=>setOpen(false)}><X size={19}/></button></div>
      <div className="sidebar-user"><div className="avatar">{(user?.name||'U').slice(0,1).toUpperCase()}</div><div><b>{user?.name||'Student'}</b><small>{role}</small></div></div>
      <nav className="sidebar-nav">{navItems.map(([to,label,I])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><I size={18}/><span>{label}</span></NavLink>)}{role==='admin'&&<NavLink to="/admin" onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><ShieldCheck size={18}/><span>Admin Dashboard</span></NavLink>}<div className="sidebar-section-label">Website</div><NavLink to="/" onClick={()=>setOpen(false)}><Eye size={18}/><span>Home</span></NavLink><NavLink to="/about" onClick={()=>setOpen(false)}><Info size={18}/><span>About</span></NavLink><NavLink to="/features" onClick={()=>setOpen(false)}><Sparkles size={18}/><span>Features</span></NavLink><NavLink to="/contact" onClick={()=>setOpen(false)}><Mail size={18}/><span>Contact</span></NavLink></nav>
      <div className="sidebar-bottom"><button onClick={toggleTheme}><span>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>} Theme</span><small>{theme}</small></button><button onClick={()=>setFontSize(fontSize==='medium'?'large':fontSize==='large'?'small':'medium')}><span><SettingsIcon size={18}/> Text size</span><small>{fontSize}</small></button><button onClick={doLogout}><span><LogOut size={18}/> Logout</span></button></div>
    </aside>
    <div className="main-content"><header className="topbar"><button className="icon-btn mobile-only" onClick={()=>setOpen(true)}><Menu/></button><div><div className="breadcrumbs"><Link to="/dashboard">Home</Link><ChevronRight size={13}/><span className="current">{title}</span></div><h2>{title}</h2></div><div className="top-actions"><Link className="icon-btn notification-btn" to="/notifications"><Bell size={19}/>{unreadCount>0&&<i>{unreadCount>9?'9+':unreadCount}</i>}</Link><Link className="profile-chip" to="/settings"><span className="avatar sm">{(user?.name||'U').slice(0,1).toUpperCase()}</span><span>{user?.name?.split(' ')[0]||'Profile'}</span></Link></div></header><main className="content-body">{children}</main></div>
    {open&&<div className="drawer-overlay" onClick={()=>setOpen(false)}/>}
  </div>;
}

function AdminShell({children}) {
  const {user,logout}=useAuth();
  const {theme,toggleTheme,fontSize,setFontSize}=useTheme();
  const [open,setOpen]=useState(false);
  const location=useLocation();
  const navigate=useNavigate();
  const doLogout=()=>{logout();navigate('/admin/login');};

  return <div className="app-container admin-app-container">
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="sidebar-brand">
        <Link to="/admin/dashboard" className="brand"><span className="brand-mark">₿</span><span>Campus <b>Coin</b></span></Link>
        <button className="icon-btn mobile-only" onClick={()=>setOpen(false)}><X size={19}/></button>
      </div>
      <div className="sidebar-user">
        <div className="avatar"><ShieldCheck size={19}/></div>
        <div><b>{user?.name||'Administrator'}</b><small>Administrator</small></div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" end onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><ShieldCheck size={18}/><span>Admin Dashboard</span></NavLink>
        <div className="sidebar-section-label">Website</div>
        <NavLink to="/" onClick={()=>setOpen(false)}><Eye size={18}/><span>Home</span></NavLink>
        <NavLink to="/about" onClick={()=>setOpen(false)}><Info size={18}/><span>About</span></NavLink>
        <NavLink to="/features" onClick={()=>setOpen(false)}><Sparkles size={18}/><span>Features</span></NavLink>
        <NavLink to="/contact" onClick={()=>setOpen(false)}><Mail size={18}/><span>Contact</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <button onClick={toggleTheme}><span>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>} Theme</span><small>{theme}</small></button>
        <button onClick={()=>setFontSize(fontSize==='medium'?'large':fontSize==='large'?'small':'medium')}><span><SettingsIcon size={18}/> Text size</span><small>{fontSize}</small></button>
        <button onClick={()=>navigate('/')}><span><Eye size={18}/> View website</span></button>
        <button onClick={doLogout}><span><LogOut size={18}/> Logout</span></button>
      </div>
    </aside>
    <div className="main-content">
      <header className="topbar">
        <button className="icon-btn mobile-only" onClick={()=>setOpen(true)}><Menu/></button>
        <div><div className="breadcrumbs"><Link to="/admin/dashboard">Admin</Link><ChevronRight size={13}/><span className="current">Admin Dashboard</span></div><h2>Admin Dashboard</h2></div>
        <div className="top-actions"><span className="profile-chip"><span className="avatar sm"><ShieldCheck size={16}/></span><span>{user?.name?.split(' ')[0]||'Admin'}</span></span></div>
      </header>
      <main className="content-body">{children}</main>
    </div>
    {open&&<div className="drawer-overlay" onClick={()=>setOpen(false)}/>}
  </div>;
}

function PageHead({title,sub,action}){return <div className="page-head"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}

function Dashboard(){
 const {user,currency}=useAuth(); const {addToast}=useNotification(); const [tx,setTx]=useState([]),[budgets,setBudgets]=useState([]),[tips,setTips]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=async()=>{setLoading(true);try{const [t,b,tp]=await Promise.all([transactionService.getTransactions({limit:100,page:1}),budgetService.getBudgets(monthNow()),tipService.getTips()]);setTx(t.transactions||[]);setBudgets(b.budgets||[]);setTips((tp.tips||[]).slice(0,3));}catch(e){setError(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);
 const income=tx.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount),0),expense=tx.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount),0),balance=income-expense;
 const recent=tx.slice(0,6);
 return <><PageHead title={`Good to see you, ${user?.name?.split(' ')[0]||'Student'} 👋`} sub="Here is your financial snapshot for this month." action={<Link to="/transactions?add=1" className="btn btn-primary"><Plus size={17}/> Add transaction</Link>}/><ErrorBox message={error}/>
 {loading?<div className="card"><div className="skeleton-line"/><div className="skeleton-line short"/></div>:<><div className="grid grid-cols-4 stat-grid"><Stat icon={CircleDollarSign} label="Balance" value={money(balance,currency)} tone="info"/><Stat icon={ArrowUpRight} label="Income" value={money(income,currency)} tone="income"/><Stat icon={ArrowDownRight} label="Expenses" value={money(expense,currency)} tone="expense"/><Stat icon={PiggyBank} label="Savings goal" value={money(user?.monthlySavingsGoal,currency)} tone="warning"/></div>
 <div className="grid grid-cols-2 dashboard-grid"><div className="card"><div className="card-header"><div><div className="card-title">Recent transactions</div><div className="card-subtitle">Latest activity</div></div><Link to="/transactions" className="text-link">View all</Link></div>{recent.length?<div className="activity-list">{recent.map(t=><div className="activity" key={t._id}><div className={`activity-icon ${t.type}`}>{t.type==='income'?<ArrowUpRight size={17}/>:<ArrowDownRight size={17}/>}</div><div className="activity-main"><b>{t.description||'Transaction'}</b><span>{t.categoryId?.name||'Uncategorized'} · {new Date(t.date).toLocaleDateString()}</span></div><strong className={t.type==='income'?'income-text':'expense-text'}>{t.type==='income'?'+':'-'}{money(t.amount,currency)}</strong></div>)}</div>:<Empty text="No transactions yet. Add your first one."/>}</div>
 <div className="card"><div className="card-header"><div><div className="card-title">This month's budgets</div><div className="card-subtitle">Track your category limits</div></div><Link to="/budgets" className="text-link">Manage</Link></div>{budgets.length?budgets.slice(0,5).map(b=><div className="budget-row" key={b._id}><div className="budget-top"><span>{b.categoryId?.name||'Category'}</span><b>{money(b.spent,currency)} / {money(b.limitAmount,currency)}</b></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{width:`${Math.min(100,b.percentage||0)}%`,background:(b.percentage||0)>=80?'var(--color-expense)':'var(--brand-primary)'}}/></div><small>{b.percentage||0}% used</small></div>):<Empty text="No budgets set for this month."/>}</div></div>
 <div className="card tips-strip"><div><div className="card-title">Saving tips for you</div><div className="card-subtitle">Small changes can add up.</div></div><div className="tip-inline-list">{tips.length?tips.map(t=><div key={t._id} className="tip-chip"><Lightbulb size={15}/><span>{t.title}</span></div>):<span className="muted">No tips available yet.</span>}</div><Link to="/tips" className="btn btn-secondary btn-sm">Explore tips</Link></div></>}</>;
}
function Stat({icon:I,label,value,tone}){return <div className="stat-card"><div className={`stat-icon-wrapper tone-${tone}`}><I size={21}/></div><div className="stat-info"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div></div>}

function Transactions(){
 const {currency}=useAuth(); const {addToast}=useNotification(); const [tx,setTx]=useState([]),[cats,setCats]=useState([]),[form,setForm]=useState({type:'expense',amount:'',description:'',categoryId:'',date:new Date().toISOString().slice(0,10),isRecurring:false,recurrenceFrequency:'none'}),[editing,setEditing]=useState(null),[modal,setModal]=useState(false),[error,setError]=useState(''),[search,setSearch]=useState(''),[typeFilter,setTypeFilter]=useState('all'),[categoryFilter,setCategoryFilter]=useState('all'),[startDate,setStartDate]=useState(''),[endDate,setEndDate]=useState('');
 const load=async()=>{try{const params={limit:1000,page:1};if(search.trim())params.search=search.trim();if(typeFilter!=='all')params.type=typeFilter;if(categoryFilter!=='all')params.categoryId=categoryFilter;if(startDate)params.startDate=startDate;if(endDate)params.endDate=endDate;const [t,c]=await Promise.all([transactionService.getTransactions(params),categoryService.getCategories()]);setTx(t.transactions||[]);setCats(c.categories||[])}catch(e){setError(e.message)}};
 useEffect(()=>{const timer=setTimeout(load,250);return()=>clearTimeout(timer)},[search,typeFilter,categoryFilter,startDate,endDate]);
 const shown=tx;
 const clearFilters=()=>{setSearch('');setTypeFilter('all');setCategoryFilter('all');setStartDate('');setEndDate('')};
 const openNew=()=>{setEditing(null);setForm({type:'expense',amount:'',description:'',categoryId:'',date:new Date().toISOString().slice(0,10),isRecurring:false,recurrenceFrequency:'none'});setModal(true)};
 const save=async e=>{e.preventDefault();setError('');try{const data={...form,amount:Number(form.amount)};if(editing)await transactionService.updateTransaction(editing,data);else await transactionService.createTransaction(data);setModal(false);addToast(editing?'Transaction updated':'Transaction added','success');load()}catch(err){setError(err.message)}};
 const edit=t=>{setEditing(t._id);setForm({type:t.type,amount:t.amount,description:t.description||'',categoryId:t.categoryId?._id||t.categoryId||'',date:new Date(t.date).toISOString().slice(0,10),isRecurring:Boolean(t.isRecurring),recurrenceFrequency:t.recurrenceFrequency||'none'});setModal(true)};
 const del=async id=>{if(!confirm('Delete this transaction?'))return;try{await transactionService.deleteTransaction(id);addToast('Transaction deleted','success');load()}catch(e){setError(e.message)}};
 return <><PageHead title="Transactions" sub="Record, search and manage every transaction." action={<button className="btn btn-primary" onClick={openNew}><Plus size={17}/> Add transaction</button>}/><ErrorBox message={error}/>
 <div className="card"><div className="transaction-filters">
   <div className="searchbox"><Search size={17}/><input aria-label="Search transactions" placeholder="Search description…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <select className="form-control" aria-label="Filter transaction type" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
   <select className="form-control" aria-label="Filter transaction category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="all">All categories</option>{cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
   <input className="form-control" type="date" aria-label="Start date" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
   <input className="form-control" type="date" aria-label="End date" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
   <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
   <span className="muted">{shown.length} transaction(s)</span>
 </div>
 <div className="table-container"><table className="table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th><th></th></tr></thead><tbody>{shown.map(t=><tr key={t._id}><td>{new Date(t.date).toLocaleDateString()}</td><td><b>{t.description||'—'}</b></td><td>{t.categoryId?.name||'—'}</td><td><span className={`badge ${t.type==='income'?'badge-income':'badge-expense'}`}>{t.type}</span></td><td className={t.type==='income'?'income-text':'expense-text'}>{t.type==='income'?'+':'-'}{money(t.amount,currency)}</td><td><button className="icon-btn" onClick={()=>edit(t)}><Edit3 size={16}/></button><button className="icon-btn danger-icon" onClick={()=>del(t._id)}><Trash2 size={16}/></button></td></tr>)}{!shown.length&&<tr><td colSpan="6"><Empty text="No matching transactions."/></td></tr>}</tbody></table></div></div>
 {modal&&<Modal title={editing?'Edit transaction':'Add transaction'} close={()=>setModal(false)}><form onSubmit={save}><div className="form-grid"><div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.type} onChange={e=>setForm({...form,type:e.target.value,categoryId:''})}><option value="expense">Expense</option><option value="income">Income</option></select></div><div className="form-group"><label className="form-label">Amount</label><input className="form-control" type="number" step="0.01" min="0.01" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div></div><div className="form-group"><label className="form-label">Category</label><select className="form-control" required value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">Select category</option>{cats.filter(c=>c.type===form.type).map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div><div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="e.g. Lunch at campus cafe"/></div><div className="form-group"><label className="form-label">Date</label><input className="form-control" type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div><div className="form-grid"><div className="form-group"><label className="form-label">Recurring?</label><select className="form-control" value={form.isRecurring?'yes':'no'} onChange={e=>setForm({...form,isRecurring:e.target.value==='yes',recurrenceFrequency:e.target.value==='yes'?(form.recurrenceFrequency||'monthly'):'none'})}><option value="no">No</option><option value="yes">Yes</option></select></div>{form.isRecurring&&<div className="form-group"><label className="form-label">Frequency</label><select className="form-control" value={form.recurrenceFrequency||'monthly'} onChange={e=>setForm({...form,recurrenceFrequency:e.target.value})}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>}</div><ErrorBox message={error}/><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary">Save transaction</button></div></form></Modal>}</>;
}

function Categories(){
 const {addToast}=useNotification(); const [cats,setCats]=useState([]),[error,setError]=useState(''),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState({name:'',type:'expense',color:'#F59E0B',icon:'tag'});
 const load=async()=>{try{const r=await categoryService.getCategories();setCats(r.categories||[])}catch(e){setError(e.message)}};useEffect(()=>{load()},[]);
 const save=async e=>{e.preventDefault();try{if(editing)await categoryService.updateCategory(editing,form);else await categoryService.createCategory(form);setModal(false);load();addToast(editing?'Category updated':'Category created','success')}catch(e){setError(e.message)}};
 const del=async id=>{if(!confirm('Delete this personal category?'))return;try{await categoryService.deleteCategory(id);load();addToast('Category deleted','success')}catch(e){setError(e.message)}};
 return <><PageHead title="Categories" sub="Manage income and expense categories for your transactions." action={<button className="btn btn-primary" onClick={()=>{setEditing(null);setForm({name:'',type:'expense',color:'#F59E0B',icon:'tag'});setModal(true)}}><Plus size={17}/> Add category</button>}/><ErrorBox message={error}/><div className="grid grid-cols-3">{cats.map(c=><div className="card category-card" key={c._id}><div className="category-icon" style={{background:c.color||'var(--brand-primary)'}}><Tags size={19}/></div><div className="category-content"><h3>{c.name}</h3><span className={`badge ${c.type==='income'?'badge-income':'badge-expense'}`}>{c.type}</span>{c.isDefault?<small className="muted">System default</small>:<div className="category-actions"><button className="icon-btn" onClick={()=>{setEditing(c._id);setForm({name:c.name,type:c.type,color:c.color||'#F59E0B',icon:c.icon||'tag'});setModal(true)}}><Edit3 size={15}/></button><button className="icon-btn danger-icon" onClick={()=>del(c._id)}><Trash2 size={15}/></button></div>}</div></div>)}{!cats.length&&<div className="card grid-span-all"><Empty text="No categories found."/></div>}</div>
 {modal&&<Modal title={editing?'Edit category':'Create category'} close={()=>setModal(false)}><form onSubmit={save}><div className="form-group"><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:cleanPersonName(e.target.value)})} pattern="[A-Za-zÀ-ÖØ-öø-ÿ '-]+" title="Name may contain letters, spaces, apostrophes and hyphens only."/></div><div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="expense">Expense</option><option value="income">Income</option></select></div><div className="form-group"><label className="form-label">Color</label><input className="form-control" type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary">Save category</button></div></form></Modal>}</>;
}

function Budgets(){
 const {currency}=useAuth(); const {addToast}=useNotification(); const [budgets,setBudgets]=useState([]),[cats,setCats]=useState([]),[month,setMonth]=useState(monthNow()),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState({categoryId:'',limitAmount:''}),[error,setError]=useState('');
 const load=async()=>{try{const [b,c]=await Promise.all([budgetService.getBudgets(month),categoryService.getCategories('expense')]);setBudgets(b.budgets||[]);setCats(c.categories||[])}catch(e){setError(e.message)}};useEffect(()=>{load()},[month]);
 const save=async e=>{e.preventDefault();try{if(editing)await budgetService.updateBudget(editing,{limitAmount:Number(form.limitAmount)});else await budgetService.createBudget({...form,month,limitAmount:Number(form.limitAmount)});setModal(false);addToast('Budget saved','success');load()}catch(e){setError(e.message)}};
 const del=async id=>{if(!confirm('Delete budget?'))return;try{await budgetService.deleteBudget(id);load()}catch(e){setError(e.message)}};
 return <><PageHead title="Budgets" sub="Set monthly category limits and watch your spending." action={<button className="btn btn-primary" onClick={()=>{setEditing(null);setForm({categoryId:'',limitAmount:''});setModal(true)}}><Plus size={17}/> New budget</button>}/><ErrorBox message={error}/><div className="toolbar standalone"><input className="form-control month-input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div><div className="grid grid-cols-3">{budgets.map(b=><div className="card budget-card" key={b._id}><div className="budget-top"><div><h3>{b.categoryId?.name||'Category'}</h3><span className="muted">{month}</span></div><span className={(b.percentage||0)>=80?'badge badge-expense':'badge badge-income'}>{b.percentage||0}%</span></div><div className="budget-amount">{money(b.spent,currency)} <small>of {money(b.limitAmount,currency)}</small></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{width:`${Math.min(100,b.percentage||0)}%`,background:(b.percentage||0)>=80?'var(--color-expense)':'var(--brand-primary)'}}/></div><div className="budget-actions"><span className="muted">{Math.max(0,Number(b.limitAmount)-Number(b.spent||0)).toFixed(2)} remaining</span><span><button className="icon-btn" onClick={()=>{setEditing(b._id);setForm({categoryId:b.categoryId?._id||'',limitAmount:b.limitAmount});setModal(true)}}><Edit3 size={16}/></button><button className="icon-btn danger-icon" onClick={()=>del(b._id)}><Trash2 size={16}/></button></span></div></div>)}{!budgets.length&&<div className="card grid-span-all"><Empty text="No budgets for this month."/></div>}</div>
 {modal&&<Modal title={editing?'Edit budget':'Create budget'} close={()=>setModal(false)}><form onSubmit={save}>{!editing&&<div className="form-group"><label className="form-label">Expense category</label><select className="form-control" required value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">Select category</option>{cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div>}<div className="form-group"><label className="form-label">Monthly limit</label><input className="form-control" type="number" step="0.01" min="1" required value={form.limitAmount} onChange={e=>setForm({...form,limitAmount:e.target.value})}/></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary">Save budget</button></div></form></Modal>}</>;
}

function Reports(){
 const {currency}=useAuth();
 const [month,setMonth]=useState(monthNow());
 const [startDate,setStartDate]=useState('');
 const [endDate,setEndDate]=useState('');
 const [typeFilter,setTypeFilter]=useState('all');
 const [categoryFilter,setCategoryFilter]=useState('all');
 const [incomeSourceFilter,setIncomeSourceFilter]=useState('all');
 const [cats,setCats]=useState([]);
 const [report,setReport]=useState(null),[six,setSix]=useState([]),[daily,setDaily]=useState([]),[weekly,setWeekly]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const filters=useMemo(()=>({month,startDate,endDate,type:typeFilter!=='all'?typeFilter:'',categoryId:categoryFilter!=='all'?categoryFilter:'',incomeSourceId:incomeSourceFilter!=='all'?incomeSourceFilter:''}),[month,startDate,endDate,typeFilter,categoryFilter,incomeSourceFilter]);
 const load=async()=>{
   setBusy(true); setError('');
   try{
     const [r,s,d,w]=await Promise.all([reportService.getMonthlyReport(filters),reportService.getSixMonthsReport(filters),reportService.getDailyReport(filters),reportService.getWeeklyReport(filters)]);
     setReport(r);setSix(s.data||[]);setDaily(d.days||[]);setWeekly(w.weeks||[]);
   }catch(e){setError(e.message||'Unable to load reports.')}finally{setBusy(false)}
 };
 useEffect(()=>{categoryService.getCategories().then(r=>setCats(r.categories||[])).catch(e=>setError(e.message||'Unable to load categories.'))},[]);
 useEffect(()=>{load()},[filters]);
 const clearFilters=()=>{setStartDate('');setEndDate('');setTypeFilter('all');setCategoryFilter('all');setIncomeSourceFilter('all')};
 const exportPdf=async()=>{try{await reportService.downloadReportPdf(filters)}catch(e){setError(e.message||'Unable to export report.')}};
 return <><PageHead title="Reports" sub="Filter your financial history by date range, category or income source." action={<button className="btn btn-secondary" onClick={exportPdf}><Download size={17}/> Export PDF</button>}/><div className="card report-filters"><div className="card-header"><div><div className="card-title">Report filters</div><div className="card-subtitle">Use any combination of filters. Leave a field empty to include everything.</div></div>{busy&&<span className="muted">Updating…</span>}</div><div className="form-grid"><div className="form-group"><label className="form-label">Report month</label><input className="form-control" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div><div className="form-group"><label className="form-label">Category</label><select className="form-control" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="all">All categories</option>{cats.map(c=><option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}</select></div><div className="form-group"><label className="form-label">Income source</label><select className="form-control" value={incomeSourceFilter} onChange={e=>{setIncomeSourceFilter(e.target.value);if(e.target.value!=='all')setTypeFilter('income')}}><option value="all">All income sources</option>{cats.filter(c=>c.type==='income').map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div><div className="form-group"><label className="form-label">Transaction type</label><select className="form-control" value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);if(e.target.value!=='income')setIncomeSourceFilter('all')}}><option value="all">Income + Expense</option><option value="income">Income only</option><option value="expense">Expense only</option></select></div><div className="form-group"><label className="form-label">Start date</label><input className="form-control" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} max={endDate||undefined}/></div><div className="form-group"><label className="form-label">End date</label><input className="form-control" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} min={startDate||undefined}/></div><div className="form-group" style={{display:'flex',alignItems:'end'}}><button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear filters</button></div></div></div><ErrorBox message={error}/>{report&&<><div className="grid grid-cols-4 stat-grid"><Stat icon={ArrowUpRight} label="Income" value={money(report.summary?.totalIncome,currency)} tone="income"/><Stat icon={ArrowDownRight} label="Expense" value={money(report.summary?.totalExpense,currency)} tone="expense"/><Stat icon={CircleDollarSign} label="Balance" value={money(report.summary?.balance,currency)} tone="info"/><Stat icon={Target} label="Top category" value={report.summary?.topSpendingCategory||'None'} tone="warning"/></div><div className="grid grid-cols-2"><div className="card"><div className="card-title">Daily spending</div><div className="bar-list">{daily.filter(x=>x.income||x.expense).map(x=><div key={x.date}><div className="bar-label"><span>{x.date}</span><b className="expense-text">-{money(x.expense,currency)}</b></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{width:`${Math.min(100,((x.expense||0)/(report.summary?.totalExpense||1))*100)}%`,background:'var(--color-expense)'}}/></div></div>)}{!daily.some(x=>x.income||x.expense)&&<Empty text="No daily activity for this month."/>}</div></div><div className="card"><div className="card-title">Weekly summary</div><div className="six-list">{weekly.map(x=><div key={x.week} className="six-row"><span>{x.week}</span><span className="income-text">+{money(x.income,currency)}</span><span className="expense-text">-{money(x.expense,currency)}</span></div>)}</div></div></div><div className="grid grid-cols-2"><div className="card"><div className="card-title">Category breakdown</div><div className="bar-list">{(report.categoryBreakdown||[]).map(x=><div key={x.id||x.name}><div className="bar-label"><span>{x.name||x.categoryName}</span><b>{money(x.total,currency)}</b></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{width:`${Math.min(100,((x.total||0)/(report.summary?.totalExpense||1))*100)}%`,background:'var(--brand-primary)'}}/></div></div>)}</div></div><div className="card"><div className="card-title">Six-month overview</div><div className="six-list">{six.map(x=><div key={x.month} className="six-row"><span>{x.month}</span><span className="income-text">+{money(x.income,currency)}</span><span className="expense-text">-{money(x.expense,currency)}</span></div>)}{!six.length&&<Empty/>}</div></div></div></>}</>;
}

function Tips(){
 const [tips,setTips]=useState([]),[error,setError]=useState(''); const {addToast}=useNotification();
 const load=async()=>{try{const r=await tipService.getTips();setTips(r.tips||[])}catch(e){setError(e.message)}};useEffect(()=>{load()},[]);
 const pin=async id=>{try{await tipService.pinTip(id);load();addToast('Tip updated','success')}catch(e){setError(e.message)}}; const dismiss=async id=>{try{await tipService.dismissTip(id);load()}catch(e){setError(e.message)}};
 return <><PageHead title="Saving Tips" sub="Practical ideas based on student spending habits."/><ErrorBox message={error}/><div className="grid grid-cols-2">{tips.map(t=><div className="card tip-card" key={t._id}><div className="tip-card-head"><div className="feature-icon"><Lightbulb size={20}/></div><span className={`badge ${t.priority==='high'?'badge-expense':t.priority==='low'?'badge-info':'badge-warning'}`}>{t.priority}</span></div><h3>{t.title}</h3><p>{t.description}</p>{t.savingsImpact>0&&<small className="income-text">Potential impact: {t.savingsImpact}</small>}<div className="tip-actions"><button className="btn btn-secondary btn-sm" onClick={()=>pin(t._id)}>{t.isPinned?'Unpin':'Pin'}</button><button className="btn btn-secondary btn-sm" onClick={()=>dismiss(t._id)}>Dismiss</button></div></div>)}{!tips.length&&<div className="card grid-span-all"><Empty text="No saving tips available."/></div>}</div></>;
}

function Insights(){
 const [insights,setInsights]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);const {addToast}=useNotification();
 const load=async()=>{try{const r=await insightService.getInsights();setInsights(r.insights||[])}catch(e){setError(e.message)}};useEffect(()=>{load()},[]);
 const generate=async()=>{setBusy(true);try{await insightService.generateInsight(monthNow());await load();addToast('AI insight generated','success')}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <><PageHead title="AI Insights" sub="Personalized monthly patterns and recommendations." action={<button className="btn btn-primary" disabled={busy} onClick={generate}><Sparkles size={17}/>{busy?'Generating…':'Generate insight'}</button>}/><ErrorBox message={error}/><div className="card insight-banner"><Sparkles size={28}/><div><h3>Your financial advisor, in context</h3><p>Insights are generated from your Campus Coin transaction history. Always review recommendations before acting on them.</p></div></div><div className="grid grid-cols-2">{insights.map(i=><div className="card" key={i._id}><div className="card-header"><div><div className="card-title">{i.month}</div><div className="card-subtitle">{new Date(i.generatedAt).toLocaleString()}</div></div><button className="icon-btn" onClick={async()=>{await insightService.toggleBookmark(i._id);load()}}>{i.isBookmarked?'★':'☆'}</button></div><p className="insight-summary">{i.summaryText}</p><div className="insight-block"><b>Pattern</b><span>{i.notablePattern}</span></div><div className="insight-block"><b>Recommendation</b><span>{i.tipText}</span></div></div>)}{!insights.length&&<div className="card grid-span-all"><Empty text="No insights yet. Generate this month's insight."/></div>}</div></>;
}

function Settings(){
 const {user,updateUser,currency}=useAuth(); const {theme,toggleTheme,fontSize,setFontSize}=useTheme(); const [form,setForm]=useState({name:user?.name||'',academicYear:user?.academicYear||'1st Year',monthlyAllowanceBaseline:user?.monthlyAllowanceBaseline||0,monthlySavingsGoal:user?.monthlySavingsGoal||0,currency:user?.currency||'$'});const [msg,setMsg]=useState('');
 const save=async e=>{e.preventDefault();try{const r=await authService.updateProfile({...form,monthlyAllowanceBaseline:Number(form.monthlyAllowanceBaseline),monthlySavingsGoal:Number(form.monthlySavingsGoal)});updateUser(r.user);setMsg('Profile saved successfully.')}catch(e){setMsg(e.message)}};
 return <><PageHead title="Settings" sub="Profile, accessibility and appearance preferences."/><div className="grid grid-cols-2"><div className="card"><div className="card-title">Profile</div><p className="card-subtitle section-sub">Keep your student information up to date.</p>{msg&&<div className="alert alert-info"><Info size={16}/>{msg}</div>}<form onSubmit={save}><div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:cleanPersonName(e.target.value)})} pattern="[A-Za-zÀ-ÖØ-öø-ÿ '-]+" title="Name may contain letters, spaces, apostrophes and hyphens only."/></div><div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email||''} disabled/></div><div className="form-group"><label className="form-label">Academic year</label><select className="form-control" value={form.academicYear} onChange={e=>setForm({...form,academicYear:e.target.value})}>{['1st Year','2nd Year','3rd Year','4th Year','Graduate','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div className="form-grid"><div className="form-group"><label className="form-label">Allowance</label><input className="form-control" type="number" min="0" value={form.monthlyAllowanceBaseline} onChange={e=>setForm({...form,monthlyAllowanceBaseline:e.target.value})}/></div><div className="form-group"><label className="form-label">Savings goal</label><input className="form-control" type="number" min="0" value={form.monthlySavingsGoal} onChange={e=>setForm({...form,monthlySavingsGoal:e.target.value})}/></div></div><button className="btn btn-primary">Save profile</button></form></div><div className="card"><div className="card-title">Appearance & accessibility</div><p className="card-subtitle section-sub">Preferences are stored on this device.</p><div className="setting-row"><div><b>Theme</b><span>Switch between light and dark mode.</span></div><button className="btn btn-secondary" onClick={toggleTheme}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>} {theme}</button></div><div className="setting-row"><div><b>Font size</b><span>Make the interface easier to read.</span></div><select className="form-control compact-select" value={fontSize} onChange={e=>setFontSize(e.target.value)}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div><div className="setting-row"><div><b>Currency</b><span>Current account currency.</span></div><span className="badge badge-info">{currency}</span></div></div></div></>;
}

function Notifications(){
 const {notifications,markAsRead,markAllAsRead,deleteNotification,deleteAllNotifications,unreadCount}=useNotification();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const clearAll=async()=>{
   if(!notifications.length || !window.confirm('Delete all notifications? This cannot be undone.')) return;
   setBusy(true); setError('');
   try{await deleteAllNotifications()}catch(e){setError(e.message||'Unable to delete notifications.')}finally{setBusy(false)}
 };
 const removeOne=async(id)=>{
   setError('');
   try{await deleteNotification(id)}catch(e){setError(e.message||'Unable to delete notification.')}
 };
 return <><PageHead title="Notifications" sub="Updates, budget alerts and system messages." action={<div style={{display:'flex',gap:8}}>{unreadCount>0&&<button className="btn btn-secondary" onClick={markAllAsRead}>Mark all read</button>}{notifications.length>0&&<button className="btn btn-secondary" disabled={busy} onClick={clearAll}><Trash2 size={16}/>{busy?'Deleting…':'Delete all'}</button>}</div>}/><ErrorBox message={error}/><div className="card">{notifications.length?notifications.map(n=><div className={`notification-row ${n.read?'':'unread'}`} key={n._id} onClick={()=>!n.read&&markAsRead(n._id)}><div className="feature-icon"><Bell size={18}/></div><div style={{flex:1}}><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div><button className="icon-btn danger-icon" title="Delete notification" aria-label="Delete notification" onClick={(e)=>{e.stopPropagation();removeOne(n._id)}}><Trash2 size={16}/></button></div>):<Empty text="You're all caught up."/>}</div></>;
}


function ImportCsv(){
  const {addToast}=useNotification(); const [file,setFile]=useState(null); const [preview,setPreview]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const previewFile=async()=>{if(!file)return;setBusy(true);setError('');try{const fd=new FormData();fd.append('file',file);const r=await csvService.previewCsv(fd);setPreview(r);addToast('CSV preview ready','success')}catch(e){setError(e.message)}finally{setBusy(false)}};
  const importValid=async()=>{if(!preview?.rows?.length)return;setBusy(true);setError('');try{const r=await csvService.importCsv(preview.rows.filter(x=>x.isValid));addToast(r.message||'Import completed','success');setPreview(null);setFile(null)}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <><PageHead title="Import Transactions" sub="Bulk import transactions from a CSV file with validation and AI category hints."/><ErrorBox message={error}/><div className="grid grid-cols-2"><div className="card"><div className="card-title">Upload CSV</div><p className="card-subtitle section-sub">Required columns: date, type, category, amount, description.</p><div className="form-group"><label className="form-label">CSV file</label><input className="form-control" type="file" accept=".csv,text/csv" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><div className="modal-footer" style={{padding:0,border:0}}><button className="btn btn-primary" disabled={!file||busy} onClick={previewFile}><Upload size={17}/>{busy?'Processing…':'Preview file'}</button></div><div className="card" style={{marginTop:18}}><b>Example</b><code style={{display:'block',marginTop:8}}>date,type,category,amount,description</code><code style={{display:'block'}}>2026-09-01,expense,Food,12.50,Campus cafe</code></div></div><div className="card"><div className="card-title">Import checklist</div><div className="activity-list"><div className="activity"><div className="activity-icon income"><CheckCircle2 size={17}/></div><div className="activity-main"><b>Validation</b><span>Rows are checked before import.</span></div></div><div className="activity"><div className="activity-icon income"><Sparkles size={17}/></div><div className="activity-main"><b>Smart categorization</b><span>Missing categories can receive AI suggestions.</span></div></div><div className="activity"><div className="activity-icon income"><Bell size={17}/></div><div className="activity-main"><b>Notification</b><span>You receive a success/failure notification.</span></div></div></div></div></div>{preview&&<div className="card" style={{marginTop:18}}><div className="card-header"><div><div className="card-title">Preview</div><div className="card-subtitle">{preview.summary?.validCount||0} valid · {preview.summary?.errorCount||0} errors</div></div><button className="btn btn-primary" disabled={busy||!(preview.summary?.validCount)} onClick={importValid}>Import valid rows</button></div><div className="table-container"><table className="table"><thead><tr><th>Row</th><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th><th>Status</th></tr></thead><tbody>{preview.rows.map(r=><tr key={r.rowNumber}><td>{r.rowNumber}</td><td>{r.date}</td><td>{r.type}</td><td>{r.category}{r.aiSuggestedCategory&&<small className="muted"> · AI: {r.aiSuggestedCategory}</small>}</td><td>{r.amount}</td><td>{r.description}</td><td>{r.isValid?<span className="badge badge-income">Valid</span>:<span className="badge badge-expense">{r.errors?.join(', ')}</span>}</td></tr>)}</tbody></table></div></div>}</>;
}

function Bookmarks(){
 const [items,setItems]=useState([]),[error,setError]=useState(''); const load=async()=>{try{const r=await bookmarkService.getBookmarks();setItems(r.bookmarks||[])}catch(e){setError(e.message)}};useEffect(()=>{load()},[]); const remove=async id=>{try{await bookmarkService.deleteBookmark(id);load()}catch(e){setError(e.message)}};
 return <><PageHead title="Bookmarks" sub="Keep your saved AI insights and useful financial guidance in one place."/><ErrorBox message={error}/><div className="grid grid-cols-2">{items.map(b=><div className="card" key={b._id}><div className="card-header"><div><span className="badge badge-info">{b.contentType}</span><div className="card-title" style={{marginTop:8}}>{b.title||'Saved item'}</div></div><button className="icon-btn danger-icon" onClick={()=>remove(b._id)}><Trash2 size={16}/></button></div><p>{b.snippet||'No preview available.'}</p></div>)}{!items.length&&<div className="card grid-span-all"><Empty text="No bookmarks yet. Star an AI insight to save it here."/></div>}</div></>;
}

function Admin(){
  const [tab,setTab]=useState('overview');
  const [stats,setStats]=useState(null),[users,setUsers]=useState([]),[categories,setCategories]=useState([]),
        [tips,setTips]=useState([]),[announcements,setAnnouncements]=useState([]),
        [error,setError]=useState(''),[search,setSearch]=useState(''),[statusFilter,setStatusFilter]=useState('all');
  const [modal,setModal]=useState(null),[form,setForm]=useState({});

  const load=async()=>{
    setError('');
    try{
      const [s,u,c,t,a]=await Promise.all([
        adminService.getStatistics(),
        adminService.getUsers({limit:1000,page:1}),
        adminService.getDefaultCategories(),
        adminService.getTipTemplates(),
        adminService.getAnnouncements()
      ]);
      setStats(s.statistics);
      setUsers(u.users||[]);
      setCategories(c.categories||[]);
      setTips(t.tips||[]);
      setAnnouncements(a.announcements||[]);
    }catch(e){setError(e.message)}
  };

  useEffect(()=>{load()},[]);

  const open=(type,item={})=>{setModal(type);setForm(item)};
  const close=()=>setModal(null);

  const save=async e=>{
    e.preventDefault();
    try{
      if(modal==='category') await (form._id?adminService.updateDefaultCategory(form._id,form):adminService.createDefaultCategory(form));
      if(modal==='tip') await (form._id?adminService.updateTipTemplate(form._id,form):adminService.createTipTemplate(form));
      if(modal==='announcement') await (form._id?adminService.updateAnnouncement(form._id,form):adminService.createAnnouncement(form));
      close(); load();
    }catch(e){setError(e.message)}
  };

  const remove=async(type,id)=>{
    if(!confirm('Delete this item? This action cannot be undone.')) return;
    try{
      if(type==='category') await adminService.deleteDefaultCategory(id);
      if(type==='tip') await adminService.deleteTipTemplate(id);
      if(type==='announcement') await adminService.deleteAnnouncement(id);
      load();
    }catch(e){setError(e.message)}
  };

  const sections=[
    {id:'overview',label:'Dashboard',icon:LayoutDashboard,help:'See the main Campus Coin statistics at a glance.'},
    {id:'users',label:'Students',icon:Users,help:'Search student accounts and enable or disable access.'},
    {id:'categories',label:'Categories',icon:Tags,help:'Manage the default income and expense categories students can use.'},
    {id:'tips',label:'Saving Tips',icon:Lightbulb,help:'Manage helpful saving guidance shown to students.'},
    {id:'announcements',label:'Announcements',icon:Megaphone,help:'Create and manage messages shown to students.'}
  ];

  const current=sections.find(x=>x.id===tab)||sections[0];
  const CurrentIcon=current.icon;
  const filteredUsers=users.filter(u=>{
    const q=search.trim().toLowerCase();
    const matchesSearch=!q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
    const matchesStatus=statusFilter==='all' || u.status===statusFilter;
    return matchesSearch && matchesStatus;
  });

  return <>
    <PageHead
      title="Admin Dashboard"
      sub="A simple control panel for managing students, categories, saving tips and announcements."
    />
    <ErrorBox message={error}/>

    <div className="admin-guide card">
      <div className="admin-guide-icon"><ShieldCheck size={22}/></div>
      <div>
        <div className="card-title">What can you do here?</div>
        <div className="card-subtitle">Use the buttons below to open one task. Each section tells you exactly what it controls.</div>
      </div>
    </div>

    <div className="admin-section-grid">
      {sections.map(({id,label,icon:Icon,help})=>(
        <button
          key={id}
          type="button"
          className={`admin-section-card ${tab===id?'active':''}`}
          onClick={()=>setTab(id)}
          title={help}
        >
          <span className="admin-section-icon"><Icon size={20}/></span>
          <span className="admin-section-copy">
            <strong>{label}</strong>
            <small>{help}</small>
          </span>
          <ChevronRight size={17}/>
        </button>
      ))}
    </div>

    <div className="admin-current card">
      <div>
        <div className="eyebrow"><CurrentIcon size={14}/> {current.label}</div>
        <h2>{current.label}</h2>
        <p>{current.help}</p>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={load} title="Refresh this section">
        <RefreshCw size={15}/> Refresh
      </button>
    </div>

    {stats&&tab==='overview'&&<>
      <div className="grid grid-cols-4 stat-grid">
        <Stat icon={Users} label="Total students" value={stats.totalUsers} tone="info"/>
        <Stat icon={CheckCircle2} label="Active students" value={stats.activeUsers} tone="income"/>
        <Stat icon={AlertTriangle} label="Disabled accounts" value={stats.disabledUsers} tone="warning"/>
        <Stat icon={ReceiptText} label="Transactions" value={stats.totalTransactions} tone="expense"/>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <div className="card-title">Platform activity</div>
          <div className="card-subtitle">Total transaction volume recorded across student accounts.</div>
          <div className="six-list">
            <div className="six-row"><span>Total income</span><b className="income-text">{money(stats.totalIncomeVolume)}</b></div>
            <div className="six-row"><span>Total expenses</span><b className="expense-text">{money(stats.totalExpenseVolume)}</b></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Popular categories</div>
          <div className="card-subtitle">Categories used most often in student transactions.</div>
          <div className="six-list">
            {(stats.mostUsedCategories||[]).slice(0,5).map(c=>
              <div className="six-row" key={c.categoryId}><span>{c.categoryName}</span><span>{c.count} transactions</span><b>{money(c.volume)}</b></div>
            )}
            {!(stats.mostUsedCategories||[]).length&&<Empty text="No category activity yet."/>}
          </div>
        </div>
      </div>
    </>}

    {tab==='users'&&
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Student accounts</div>
            <div className="card-subtitle">Search student accounts and manage whether an account is active or disabled.</div>
          </div>
          <div className="admin-filters">
            <div className="searchbox">
              <Search size={17}/>
              <input aria-label="Search students" placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-control admin-filter-select" aria-label="Filter students by status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="all">All students</option>
              <option value="active">Active only</option>
              <option value="disabled">Disabled only</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredUsers.map(u=>
                <tr key={u._id}>
                  <td><b>{u.name}</b><small className="muted">{u.role}</small></td>
                  <td>{u.email}</td>
                  <td><span className={u.status==='active'?'badge badge-income':'badge badge-expense'}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role!=='admin'&&
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title={u.status==='active'?'Disable this student account':'Enable this student account'}
                          onClick={async()=>{
                            try{await adminService.toggleDisableUser(u._id);load()}catch(e){setError(e.message)}
                          }}
                        >
                          {u.status==='active'?'Disable account':'Enable account'}
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              )}
              {!filteredUsers.length&&<tr><td colSpan="5"><Empty text="No students match your search/filter."/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    }

    {tab==='categories'&&
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Default categories</div>
            <div className="card-subtitle">These are shared category options available to students.</div>
          </div>
          <button className="btn btn-primary" onClick={()=>open('category',{name:'',type:'expense',color:'#4F46E5',icon:'tag'})}><Plus size={16}/> Add category</button>
        </div>
        <div className="grid grid-cols-3">
          {categories.map(c=>
            <div className="card category-card" key={c._id}>
              <div className="category-icon" style={{background:c.color}}><Tags size={18}/></div>
              <div className="category-content">
                <h3>{c.name}</h3>
                <span className="badge badge-info">{c.type}</span>
                <div className="category-actions">
                  <button className="icon-btn" title={`Edit ${c.name}`} onClick={()=>open('category',c)}><Edit3 size={15}/></button>
                  <button className="icon-btn danger-icon" title={`Delete ${c.name}`} onClick={()=>remove('category',c._id)}><Trash2 size={15}/></button>
                </div>
              </div>
            </div>
          )}
          {!categories.length&&<Empty text="No default categories found."/>}
        </div>
      </div>
    }

    {tab==='tips'&&
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Saving tips</div>
            <div className="card-subtitle">Short financial guidance that can be shown to students.</div>
          </div>
          <button className="btn btn-primary" onClick={()=>open('tip',{title:'',description:'',categoryName:'',priority:'medium',savingsImpact:0})}><Plus size={16}/> Add saving tip</button>
        </div>
        <div className="grid grid-cols-2">
          {tips.map(t=>
            <div className="card tip-card" key={t._id}>
              <div className="tip-card-head">
                <span className="badge badge-info">{t.priority}</span>
                <div className="category-actions">
                  <button className="icon-btn" title={`Edit ${t.title}`} onClick={()=>open('tip',t)}><Edit3 size={15}/></button>
                  <button className="icon-btn danger-icon" title={`Delete ${t.title}`} onClick={()=>remove('tip',t._id)}><Trash2 size={15}/></button>
                </div>
              </div>
              <h3>{t.title}</h3><p>{t.description}</p>
            </div>
          )}
          {!tips.length&&<Empty text="No saving tips yet."/>}
        </div>
      </div>
    }

    {tab==='announcements'&&
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Announcements</div>
            <div className="card-subtitle">Create and manage system-wide messages for students.</div>
          </div>
          <button className="btn btn-primary" onClick={()=>open('announcement',{title:'',message:'',priority:'info',active:true})}><Megaphone size={16}/> New announcement</button>
        </div>
        <div className="grid grid-cols-2">
          {announcements.map(a=>
            <div className="card" key={a._id}>
              <div className="card-header">
                <span className="badge badge-info">{a.priority}</span>
                <div className="category-actions">
                  <button className="icon-btn" title={`Edit ${a.title}`} onClick={()=>open('announcement',a)}><Edit3 size={15}/></button>
                  <button className="icon-btn danger-icon" title={`Delete ${a.title}`} onClick={()=>remove('announcement',a._id)}><Trash2 size={15}/></button>
                </div>
              </div>
              <h3>{a.title}</h3><p>{a.message}</p>
              <small className="muted">{a.active?'Active':'Inactive'}</small>
            </div>
          )}
          {!announcements.length&&<Empty text="No announcements yet."/>}
        </div>
      </div>
    }

    {modal&&
      <Modal title={`${form._id?'Edit':'Create'} ${modal==='tip'?'saving tip':modal}`} close={close}>
        <form onSubmit={save}>
          {modal==='category'&&<>
            <div className="form-group"><label className="form-label">Category name</label><input className="form-control" required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.type||'expense'} onChange={e=>setForm({...form,type:e.target.value})}><option value="expense">Expense</option><option value="income">Income</option></select></div>
            <div className="form-group"><label className="form-label">Color</label><input className="form-control" type="color" value={form.color||'#4F46E5'} onChange={e=>setForm({...form,color:e.target.value})}/></div>
          </>}
          {modal==='tip'&&<>
            <div className="form-group"><label className="form-label">Tip title</label><input className="form-control" required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Tip description</label><textarea className="form-control" required value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div className="form-grid"><input className="form-control" placeholder="Category (optional)" value={form.categoryName||''} onChange={e=>setForm({...form,categoryName:e.target.value})}/><select className="form-control" value={form.priority||'medium'} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          </>}
          {modal==='announcement'&&<>
            <div className="form-group"><label className="form-label">Announcement title</label><input className="form-control" required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" required value={form.message||''} onChange={e=>setForm({...form,message:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Priority</label><select className="form-control" value={form.priority||'info'} onChange={e=>setForm({...form,priority:e.target.value})}><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select></div>
          </>}
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary">Save changes</button></div>
        </form>
      </Modal>
    }
  </>;
}
function Modal({title,close,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal-content"><div className="modal-header"><h3>{title}</h3><button className="icon-btn" onClick={close}><X size={18}/></button></div><div className="modal-body">{children}</div></div></div>}

function App(){
 return <Routes>
 <Route path="/" element={<Landing/>}/>
 <Route path="/about" element={<PublicInfoPage type="about"/>}/>
 <Route path="/features" element={<PublicInfoPage type="features"/>}/>
 <Route path="/faq" element={<PublicInfoPage type="faq"/>}/>
 <Route path="/contact" element={<ContactPage/>}/>
 <Route path="/login" element={<PublicOnly><AuthPage mode="login"/></PublicOnly>}/>
 <Route path="/register" element={<PublicOnly><AuthPage mode="register"/></PublicOnly>}/>
 <Route path="/forgot-password" element={<PublicOnly><ForgotPassword/></PublicOnly>}/>
 <Route path="/reset-password" element={<ResetPassword/>}/>
 <Route path="/reset-password/:token" element={<ResetPassword/>}/>
 <Route path="/app/*" element={<Navigate to="/dashboard" replace/>}/>
 <Route path="/dashboard" element={<Protected><AppShell><Dashboard/></AppShell></Protected>}/><Route path="/categories" element={<Protected><AppShell><Categories/></AppShell></Protected>}/><Route path="/transactions" element={<Protected><AppShell><Transactions/></AppShell></Protected>}/><Route path="/import" element={<Protected><AppShell><ImportCsv/></AppShell></Protected>}/><Route path="/budgets" element={<Protected><AppShell><Budgets/></AppShell></Protected>}/><Route path="/reports" element={<Protected><AppShell><Reports/></AppShell></Protected>}/><Route path="/tips" element={<Protected><AppShell><Tips/></AppShell></Protected>}/><Route path="/insights" element={<Protected><AppShell><Insights/></AppShell></Protected>}/><Route path="/bookmarks" element={<Protected><AppShell><Bookmarks/></AppShell></Protected>}/><Route path="/settings" element={<Protected><AppShell><Settings/></AppShell></Protected>}/><Route path="/notifications" element={<Protected><AppShell><Notifications/></AppShell></Protected>}/><Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin" element={<Navigate to="/admin/dashboard" replace/>}/><Route path="/admin/dashboard" element={<Protected admin><AdminShell><Admin/></AdminShell></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
export default App;
