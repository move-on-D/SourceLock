import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import VaultPage from './pages/VaultPage';
import ReaderPage from './pages/ReaderPage';
import MemoryPage from './pages/MemoryPage';
import PlannerPage from './pages/PlannerPage';
import UniversityPage from './pages/UniversityPage';
import LoginPage from './pages/LoginPage';
import { 
  FolderLock, 
  BrainCircuit, 
  CalendarRange, 
  GraduationCap, 
  ShieldCheck, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

function TopNavigation({ user, onLogout }: { user: any; onLogout: () => void }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Document Vault', icon: FolderLock },
    { path: '/reader', label: 'Split-Screen Reader', icon: BookOpen },
    { path: '/memory', label: 'All-Time Memory', icon: BrainCircuit },
    { path: '/planner', label: 'Study Planner', icon: CalendarRange },
    { path: '/university', label: 'University Watch', icon: GraduationCap },
  ];

  return (
    <header className="bg-sky-400/30 border-b-2 border-sky-300 px-3 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 shadow-sm backdrop-blur-md">
      
      {/* Brand & User Profile */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-md shadow-sky-400/40 border-2 border-white">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-base md:text-lg text-slate-900 tracking-tight leading-none">SourceLock</h1>
            <span className="text-[10px] md:text-[11px] text-sky-800 font-bold uppercase tracking-wider">Study SPACE</span>
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-sky-300 shadow-sm">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover border border-sky-400" />
          ) : (
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-black">
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

      {/* TOP HORIZONTAL RECTANGLE GLASS SHINING YELLOW BUTTONS (Touch scrollable on mobile) */}
      <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 justify-start md:justify-center no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl font-black text-[11px] md:text-xs flex items-center gap-1.5 md:gap-2 transition-all duration-300 shrink-0 uppercase tracking-wider shadow-md whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.8)] scale-102 ring-2 ring-yellow-400'
                  : 'bg-yellow-300/90 hover:bg-yellow-400 text-slate-950 border-2 border-yellow-400 shadow-sm'
              }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-950 stroke-[3]" />
              <span className="font-black text-slate-950">{item.label}</span>
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
        
        {/* CENTERED SKY BLUE APP CONTAINER (Full screen on mobile, floating card on desktop) */}
        <div className="w-full max-w-7xl min-h-screen md:min-h-0 md:h-[94vh] bg-sky-50/95 rounded-none md:rounded-3xl border-0 md:border-2 border-sky-300 shadow-[0_20px_60px_rgba(14,165,233,0.35)] flex flex-col overflow-hidden backdrop-blur-xl">
          
          {/* Top Navigation Bar with Horizontal Rectangle Glass Yellow Buttons */}
          <TopNavigation user={user} onLogout={handleLogout} />

          {/* Main Workspace Section */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-sky-50 to-sky-100">
            <Routes>
              <Route path="/" element={<VaultPage />} />
              <Route path="/reader" element={<ReaderPage />} />
              <Route path="/read/:id" element={<ReaderPage />} />
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
