import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CollegeAIPage from './pages/CollegeAIPage';
import MemoryPage from './pages/MemoryPage';
import PlannerPage from './pages/PlannerPage';
import UniversityPage from './pages/UniversityPage';
import LoginPage from './pages/LoginPage';
import { 
  Sparkles,
  BrainCircuit, 
  CalendarRange, 
  GraduationCap, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { useState } from 'react';

function TopNavigation({ user, onLogout }: { user: any; onLogout: () => void }) {
  const location = useLocation();

  // SourceLock 2.0 Core Spaces: AI Companion, Academic Lock, and Study Planner
  const navItems = [
    { path: '/', label: 'College AI', icon: Sparkles },
    { path: '/memory', label: 'Academic Lock', icon: BrainCircuit },
    { path: '/planner', label: 'Study Planner', icon: CalendarRange },
  ];

  const isUnivActive = location.pathname.startsWith('/university');

  return (
    <header className="bg-sky-400/30 border-b-2 border-sky-300 px-3 py-2.5 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0 shadow-sm backdrop-blur-md">
      
      {/* Brand & User Profile */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-md shadow-sky-400/40 border border-white">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm md:text-base text-slate-900 tracking-tight leading-none">SourceLock</h1>
            <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider">College SPACE</span>
          </div>
        </div>

        {/* User Profile Badge & On-Demand Univ Watch */}
        <div className="flex items-center gap-2">
          <Link
            to="/university"
            title="University Watch - Live Official Scraper Proofs"
            className={`px-2.5 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
              isUnivActive
                ? 'bg-sky-700 text-white border-sky-800 shadow-sm'
                : 'bg-white/90 hover:bg-white text-slate-700 border-sky-300 hover:text-sky-800'
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${isUnivActive ? 'text-white' : 'text-sky-600'}`} />
            <span className="hidden sm:inline">Univ Watch</span>
          </Link>

          <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-sky-300 shadow-sm">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-sky-400" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center text-white text-[10px] font-black">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
            )}
            <span className="text-xs font-extrabold text-slate-800">{user?.name}</span>
            <button 
              onClick={onLogout} 
              title="Logout" 
              className="ml-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP COMPACT RECTANGLE GLASS SHINING YELLOW BUTTONS (3 Core Focus Spaces) */}
      <nav className="flex items-center gap-1.5 md:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 justify-start md:justify-center no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            (item.path === '/' && (location.pathname === '/' || location.pathname === '/ai')) ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-xs md:text-sm flex items-center gap-1.5 transition-all duration-200 shrink-0 uppercase tracking-wider shadow-sm whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-500 shadow-[0_0_12px_rgba(250,204,21,0.7)] scale-102 ring-1 ring-yellow-400'
                  : 'bg-yellow-300/90 hover:bg-yellow-400 text-slate-950 border border-yellow-400 shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="font-extrabold text-slate-950">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </header>
  );
}

function App() {
  const [user, setUser] = useState<{ name: string; avatarUrl: string } | null>(() => {
    const saved = localStorage.getItem('sourcelock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (name: string, avatarUrl: string) => {
    const userData = { name, avatarUrl };
    localStorage.setItem('sourcelock_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sourcelock_user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen w-full bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 text-slate-900 font-sans antialiased flex items-center justify-center p-0 md:p-6">
        
        {/* CENTERED SKY BLUE APP CONTAINER */}
        <div className="w-full max-w-7xl min-h-screen md:min-h-0 md:h-[94vh] bg-sky-50/95 rounded-none md:rounded-3xl border-0 md:border-2 border-sky-300 shadow-[0_20px_60px_rgba(14,165,233,0.35)] flex flex-col overflow-hidden backdrop-blur-xl">
          
          {/* Top Navigation Bar */}
          <TopNavigation user={user} onLogout={handleLogout} />

          {/* Main Workspace Section */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-sky-50 to-sky-100">
            <Routes>
              <Route path="/" element={<CollegeAIPage />} />
              <Route path="/ai" element={<CollegeAIPage />} />
              <Route path="/memory" element={<MemoryPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/university" element={<UniversityPage />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;
