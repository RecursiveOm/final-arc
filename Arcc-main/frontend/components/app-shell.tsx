'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Home as HomeIcon,
  LayoutGrid,
  BarChart3,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Film,
  AlignLeft,
  Network,
  MessageSquare,
  ListVideo,
  BookOpen,
  AlertCircle,
  Bell,
  Zap,
  ChevronDown,
  Activity,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { api, type Video, type Settings } from '@/lib/api';

export function ArcMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" className="arc-mark-svg">
      <defs>
        <linearGradient id="arc-glow-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent, #5E6AD2)" />
          <stop offset="0.5" stopColor="#818CF8" />
          <stop offset="1" stopColor="var(--accent, #5E6AD2)" />
        </linearGradient>
      </defs>
      <path
        d="M6 26 L16 5 L26 26 M10.5 19.5 L21.5 19.5"
        stroke="url(#arc-glow-grad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type AppContextType = {
  videos: Video[];
  settings: Settings | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  theme: string;
  setTheme: (value: string) => void;
};

const Context = createContext<AppContextType | null>(null);

export function useApp() {
  return useContext(Context)!;
}

export const sections = [
  { slug: '', label: 'Overview', icon: Film },
  { slug: 'timeline', label: 'Timeline', icon: ListVideo },
  { slug: 'transcript', label: 'Transcript', icon: AlignLeft },
  { slug: 'topics', label: 'Topics', icon: Network },
  { slug: 'notes', label: 'Study Notes', icon: BookOpen },
  { slug: 'chat', label: 'Ask ARC', icon: MessageSquare },
];

export function Drawer({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`drawer ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-content">
        <div className="drawer-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label={`Close ${title}`}>
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function ThemeControl({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useApp();
  return (
    <div className={`theme-control ${compact ? 'compact' : ''}`} role="group" aria-label="Theme">
      {[
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'Auto' },
      ].map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          title={compact ? `Quick ${value} theme` : `${value} theme`}
          aria-label={compact ? `Quick ${value} theme` : `${value} theme`}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`theme-option-btn ${theme === value ? 'active' : ''}`}
        >
          <Icon size={14} />
          <span>{compact ? label : value}</span>
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const videoId = path.match(/^\/video\/([^/]+)/)?.[1];
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setThemeState] = useState('system');
  const [drawer, setDrawer] = useState(false);
  const [localMode, setLocalMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('arc-sidebar-collapsed');
      if (savedCollapsed !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSidebarCollapsed(savedCollapsed === 'true');
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('arc-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const refresh = useCallback(async () => {
    try {
      const [v, s] = await Promise.all([api<Video[]>('/videos'), api<Settings>('/settings')]);
      setVideos(v);
      setSettings(s);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with local backend periodically
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const timer = setInterval(() => void refresh(), 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  // Hydrate theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arc-theme') || 'system';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(saved);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const value = localStorage.getItem('arc-theme') || 'system';
      document.documentElement.dataset.theme = value === 'system' ? (media.matches ? 'dark' : 'light') : value;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  function setTheme(value: string) {
    localStorage.setItem('arc-theme', value);
    setThemeState(value);
    document.documentElement.dataset.theme =
      value === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
  }

  const nav = (
    <div className="sidebar-container">
      {/* Brand Header */}
      <div className="brand-header">
        <Link href="/" className="brand" aria-label="ARC home" onClick={() => setDrawer(false)}>
          <ArcMark size={28} />
          <span className="brand-title">ARC</span>
        </Link>
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav aria-label="Main navigation" className="sidebar-nav">
        {/* Home Link (also acts as 'New analysis' for E2E tests) */}
        <Link
          href="/"
          title="Home"
          aria-label="New analysis"
          className={`nav-item ${path === '/' ? 'active' : ''}`}
          aria-current={path === '/' ? 'page' : undefined}
          onClick={() => setDrawer(false)}
        >
          <HomeIcon size={18} />
          <span>Home</span>
        </Link>

        {/* Workspace Link */}
        <Link
          href={videoId ? `/video/${videoId}` : videos.length ? `/video/${videos[0].id}` : '/'}
          title="Workspace"
          aria-label="Workspace"
          className={`nav-item ${videoId || path.startsWith('/video') ? 'active' : ''}`}
          aria-current={videoId || path.startsWith('/video') ? 'page' : undefined}
          onClick={() => setDrawer(false)}
        >
          <LayoutGrid size={18} />
          <span>Workspace</span>
        </Link>

        {/* Analytics Link */}
        <Link
          href="/library"
          title="Analytics"
          aria-label="Analytics"
          className={`nav-item ${path === '/library' ? 'active' : ''}`}
          onClick={() => setDrawer(false)}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </Link>

        {/* History / Library Link (accessible as Library for E2E tests) */}
        <Link
          href="/library"
          title="Library"
          aria-label="Library"
          className={`nav-item ${path === '/library' ? 'active' : ''}`}
          aria-current={path === '/library' ? 'page' : undefined}
          onClick={() => setDrawer(false)}
        >
          <HistoryIcon size={18} />
          <span>History</span>
        </Link>

        {/* Settings Link */}
        <Link
          href="/settings"
          title="Settings"
          aria-label="Settings"
          className={`nav-item ${path === '/settings' ? 'active' : ''}`}
          aria-current={path === '/settings' ? 'page' : undefined}
          onClick={() => setDrawer(false)}
        >
          <SettingsIcon size={18} />
          <span>Settings</span>
        </Link>

        {videoId && (
          <div className="context-nav">
            <span className="context-label">VIDEO SECTIONS</span>
            {sections.map(({ slug, label, icon: Icon }) => {
              const href = `/video/${videoId}${slug ? '/' + slug : ''}`;
              return (
                <Link
                  key={slug}
                  href={href}
                  title={label}
                  aria-label={label}
                  aria-current={path === href ? 'page' : undefined}
                  onClick={() => setDrawer(false)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Sidebar Widgets */}
      <div className="sidebar-footer">
        {/* Local Mode Card */}
        <div className="local-mode-card">
          <div className="local-mode-icon">
            <Zap size={14} />
          </div>
          <div className="local-mode-info">
            <div className="local-mode-title">Local Mode</div>
            <div className="local-mode-subtitle">Your data stays on your machine</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={localMode}
            className={`toggle-switch ${localMode ? 'active' : ''}`}
            aria-label="Toggle local mode"
            onClick={() => setLocalMode(!localMode)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="user-profile-pill">
          <div className="avatar-circle">OZ</div>
          <div className="user-info">
            <span className="user-name">Omkar Zunje</span>
          </div>
          <ChevronDown size={14} className="user-dropdown-icon" />
        </div>
      </div>
    </div>
  );

  return (
    <Context.Provider value={{ videos, settings, loading, error, refresh, theme, setTheme }}>
      <div className="app-shell">
        {/* Background Ambient Cosmic Horizon Glow */}
        <div className="ambient-cosmic-glow" aria-hidden="true">
          <div className="cosmic-wave wave-1" />
          <div className="cosmic-wave wave-2" />
        </div>

        <aside className={`rail ${sidebarCollapsed ? 'collapsed' : ''}`}>{nav}</aside>

        {drawer && (
          <Drawer title="Navigation" onClose={() => setDrawer(false)} className="navigation-drawer">
            {nav}
          </Drawer>
        )}

        <div className={`main-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setDrawer(true)}
              >
                <Menu size={20} />
              </button>
              <button
                type="button"
                className="icon-button desktop-sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
              <Link href="/" className="wordmark">
                ARC<span>/</span>
              </Link>
              <span className="topbar-label">
                {path === '/library'
                  ? 'Your Library'
                  : path === '/settings'
                  ? 'Workspace Settings'
                  : videoId
                  ? 'Video Intelligence'
                  : 'Workspace'}
              </span>
            </div>

            <div className="topbar-right">
              {/* Local Engine Active Status Pill */}
              <div className="engine-status-pill">
                <span className="live-status-dot" />
                <span>Local Engine Active</span>
                <Activity size={13} className="engine-wave-icon" />
              </div>

              {/* 3-Option Theme Control (Light / Dark / System) */}
              <ThemeControl compact />

              {/* Notifications Bell */}
              <button className="icon-button notif-btn" aria-label="Notifications" title="Notifications">
                <Bell size={16} />
                <span className="notif-badge" />
              </button>
            </div>
          </header>

          <main id="main-content">{children}</main>
        </div>
      </div>
    </Context.Provider>
  );
}

export function ErrorNotice({
  title = 'Something needs your attention.',
  detail,
  retry,
}: {
  title?: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={18} color="var(--danger)" />
        <strong>{title}</strong>
      </div>
      <details>
        <summary>View diagnostic details</summary>
        <p>{detail}</p>
      </details>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
