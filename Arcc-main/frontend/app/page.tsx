'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Link as LinkIcon,
  Loader2,
  FolderUp,
  FileVideo,
  X,
  Languages,
  CheckCircle2,
  Play,
  AudioWaveform,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Zap,
  Lock,
  Cpu,
  LayoutGrid,
  Sparkles,
  Layers,
  Network,
  Clock,
  Bot,
  PlayCircle,
  ShieldCheck,
  HardDrive,
  Database,
  Search,
} from 'lucide-react';
import { api, type Video } from '@/lib/api';
import { ErrorNotice, useApp } from '@/components/app-shell';
import { VideoCard } from '@/components/library';

type ToolTab = 'video' | 'speech' | 'summary' | 'qa';

export default function Home() {
  const { videos, settings, error: loadError, refresh } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ToolTab>('video');
  const [language, setLanguage] = useState('auto');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const upload = useRef<HTMLInputElement>(null);

  // Interactive Capability Showcase State
  const [showcaseTab, setShowcaseTab] = useState<'speech' | 'chapters' | 'clusters' | 'qa'>('speech');
  const [demoLang, setDemoLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [citationModalOpen, setCitationModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('video');
    const view = params.get('view');
    if (id) router.replace(`/video/${encodeURIComponent(id)}`);
    else if (view === 'library' || view === 'settings') router.replace('/' + view);
  }, [router]);

  async function ingest(kind: 'url' | 'file') {
    setBusy(true);
    setError('');
    try {
      let result: Video;
      if (kind === 'url') {
        result = await api<Video>('/videos/youtube', {
          method: 'POST',
          body: JSON.stringify({ url, language }),
        });
      } else {
        if (!file) throw new Error('Please select a video file first.');
        const form = new FormData();
        form.append('file', file);
        form.append('language', language);
        result = await api<Video>('/videos/upload', {
          method: 'POST',
          body: form,
        });
      }
      void refresh();
      router.push(`/video/${result.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function choose(f: File | undefined) {
    if (!f) return;
    if (!/\.(mp4|mov|webm|mkv|mp3|wav|m4a)$/i.test(f.name)) {
      setError('Unsupported file type. Please choose an MP4, MOV, WebM, MKV, MP3, WAV or M4A file.');
      return;
    }
    if (f.size > (settings?.max_upload_mb || 1024) * 1024 ** 2) {
      setError(`This file exceeds the ${settings?.max_upload_mb || 1024} MB upload limit.`);
      return;
    }
    setError('');
    setFile(f);
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleHeroUploadClick() {
    scrollToSection('ingest-workspace');
    if (!file) {
      setTimeout(() => {
        upload.current?.click();
      }, 250);
    }
  }

  return (
    <div className="landing-container">
      {/* ====================================================================
          1. CINEMATIC HERO SECTION (Visual Reference: Fullscreen Video)
          ==================================================================== */}
      <section className="hero-cinematic" id="hero">
        {/* Full-Screen Autoplaying Looping Background Video */}
        <div className="hero-video-wrap" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/hero-poster.jpg"
            className="hero-bg-video"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Subtle dark vignette overlay for perfect contrast & readability */}
          <div className="hero-vignette-overlay" />
        </div>

        {/* Minimal Luxury Navigation Bar on Hero */}
        <nav className="hero-nav-bar" aria-label="Hero navigation">
          <div className="hero-nav-brand">
            <span className="brand-monogram">A R C</span>
          </div>

          <div className="hero-nav-links">
            <button type="button" onClick={() => scrollToSection('hero')} className="hero-nav-link active">
              01 OVERVIEW
            </button>
            <button type="button" onClick={() => scrollToSection('ingest-workspace')} className="hero-nav-link">
              02 WORKSPACE
            </button>
            <button type="button" onClick={() => scrollToSection('pipeline')} className="hero-nav-link">
              03 PIPELINE
            </button>
            <button type="button" onClick={() => scrollToSection('capabilities')} className="hero-nav-link">
              04 CAPABILITIES
            </button>
            <button type="button" onClick={() => scrollToSection('architecture')} className="hero-nav-link">
              05 ARCHITECTURE
            </button>
          </div>

          <div className="hero-nav-actions">
            <button
              type="button"
              className="champagne-pill-btn small"
              onClick={handleHeroUploadClick}
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </nav>

        {/* Hero Central Content */}
        <div className="hero-content">
          {/* Eyebrow Capsule Pill */}
          <div className="hero-eyebrow-pill">
            <span className="hero-eyebrow-dot" />
            <span>ARC VIDEO INTELLIGENCE ECOSYSTEM</span>
          </div>

          {/* Grand Headline */}
          <h1 className="hero-headline">
            Making Every Video <span className="gold-text">Intelligent.</span>
          </h1>

          {/* Supporting Statement */}
          <p className="hero-subtitle">
            An integrated video intelligence ecosystem connecting on-device transcription,
            dense semantic embeddings, hierarchical synthesis, and verified timestamped Q&amp;A.
          </p>

          {/* Primary CTA Buttons */}
          <div className="hero-cta-row">
            <button
              type="button"
              className="champagne-pill-btn"
              onClick={handleHeroUploadClick}
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="frosted-pill-btn"
              onClick={() => scrollToSection('capabilities')}
            >
              <span>EXPLORE CAPABILITIES</span>
            </button>
          </div>

          {/* Animated Scroll Indicator */}
          <div className="hero-scroll-indicator" onClick={() => scrollToSection('ingest-workspace')}>
            <span>SCROLL</span>
            <div className="scroll-drop-line" />
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. THE WORKSPACE COMMAND CENTER ("Understand every moment.")
          ==================================================================== */}
      <section id="ingest-workspace" className="workspace-section" aria-label="ARC Workspace">
        <div className="workspace-section-header">
          <div className="eyebrow-badge">
            <span className="sparkle-glyph">✦</span>
            <span>ANALYSIS COMMAND CENTER</span>
          </div>

          {/* Heading required for E2E tests and user context */}
          <h2 className="workspace-heading">
            Understand every <span className="gold-text">moment.</span>
          </h2>

          <p className="workspace-subtitle">
            Ingest local files or YouTube videos to extract multilingual transcripts, chapter boundaries,
            semantic 2D clusters, and exact-second evidence citations.
          </p>
        </div>

        {(error || loadError) && (
          <ErrorNotice
            title="Could not process your request"
            detail={error || loadError}
            retry={() => (error ? void ingest(file ? 'file' : 'url') : void refresh())}
          />
        )}

        {/* Main Glass Ingest Card */}
        <div className="ingest-card" aria-label="Analyze a video">
          {/* Tool Switcher Tabs */}
          <div className="tool-switcher-tabs" role="tablist" aria-label="ARC Tools">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'video'}
              className={`tool-tab ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              <Play size={14} className="tab-icon fill-icon" />
              <span>Video Analysis</span>
              {activeTab === 'video' && <span className="active-tab-indicator" />}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'speech'}
              className={`tool-tab ${activeTab === 'speech' ? 'active' : ''}`}
              onClick={() => setActiveTab('speech')}
            >
              <AudioWaveform size={14} className="tab-icon" />
              <span>Speech to Text</span>
              {activeTab === 'speech' && <span className="active-tab-indicator" />}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'summary'}
              className={`tool-tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <FileText size={14} className="tab-icon" />
              <span>Summarization</span>
              {activeTab === 'summary' && <span className="active-tab-indicator" />}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'qa'}
              className={`tool-tab ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              <MessageSquare size={14} className="tab-icon" />
              <span>Q&amp;A</span>
              {activeTab === 'qa' && <span className="active-tab-indicator" />}
            </button>

            <button type="button" className="tool-tab more-tools-tab">
              <span>More Tools</span>
              <ChevronDown size={13} className="more-chevron" />
            </button>
          </div>

          {/* Central File Dropzone */}
          <div
            className={`upload-dropzone-hero ${drag ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (!busy) choose(e.dataTransfer.files[0]);
            }}
            onClick={() => !file && !busy && upload.current?.click()}
          >
            <input
              ref={upload}
              type="file"
              aria-label="Upload video file"
              accept=".mp4,.mov,.webm,.mkv,.mp3,.wav,.m4a"
              hidden
              onChange={(e) => choose(e.target.files?.[0])}
            />

            <div className="dropzone-center">
              <div className="folder-icon-glow">
                {file ? <FileVideo size={28} /> : <FolderUp size={28} />}
              </div>

              {file ? (
                <div className="dropzone-file-selected">
                  <strong className="filename">
                    <CheckCircle2 size={16} color="var(--success)" />
                    {file.name}
                  </strong>
                  <span className="file-meta">
                    {(file.size / 1024 ** 2).toFixed(1)} MB · Ready for on-device transcription
                  </span>
                  <div className="file-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="button primary" disabled={busy} onClick={() => ingest('file')}>
                      {busy ? <Loader2 size={16} className="spin" /> : 'Analyze file'}
                      <ArrowRight size={15} />
                    </button>
                    <button className="text-button" disabled={busy} onClick={() => setFile(null)}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dropzone-text-content">
                  <h3 className="dropzone-title">Drag &amp; drop your video here</h3>
                  <p className="dropzone-subtitle">or click to browse local files</p>
                  <span className="dropzone-formats">
                    Supports MP4, MOV, WebM, MKV • Up to {settings?.max_upload_mb || 1024}MB
                  </span>
                </div>
              )}
            </div>

            {!file && (
              <div className="browse-btn-wrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="browse-pill-button"
                  disabled={busy}
                  onClick={() => upload.current?.click()}
                >
                  <span>Browse Files</span>
                  <ArrowRight size={15} className="browse-arrow" />
                </button>
              </div>
            )}
          </div>

          {/* Ingest Secondary Options: YouTube URL and Speech Language */}
          <div className="ingest-secondary-bar">
            <div className="youtube-ingest-group">
              <div className="ingest-heading">
                <div className="ingest-label">
                  <LinkIcon size={15} />
                  <label htmlFor="youtube-url">Start with a YouTube link</label>
                </div>
              </div>

              <form
                className="url-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void ingest('url');
                }}
              >
                <input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  required
                  value={url}
                  disabled={busy}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {url && !busy && (
                  <button
                    type="button"
                    className="icon-button"
                    style={{ width: '32px', height: '32px', alignSelf: 'center' }}
                    onClick={() => setUrl('')}
                    aria-label="Clear URL"
                  >
                    <X size={15} />
                  </button>
                )}
                <button className="button primary" disabled={busy || !url.trim()}>
                  {busy ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Starting…
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="language-picker-group">
              <div className="language-picker">
                <div className="label-with-icon">
                  <Languages size={15} color="var(--accent)" aria-hidden="true" />
                  <label htmlFor="speech-language">Speech language</label>
                </div>
                <select
                  id="speech-language"
                  value={language}
                  disabled={busy}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="auto">Detect automatically</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi · हिन्दी</option>
                  <option value="mr">Marathi · मराठी</option>
                </select>
                <span className="lang-hint">
                  {language === 'mr' || language === 'hi'
                    ? 'Translates saved text to English for analysis while keeping original audio and transcript.'
                    : 'Hindi & Marathi automatically translate to English for summaries.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Trust Cards Grid */}
        <div className="feature-cards-grid" aria-label="Features">
          <div className="feature-card">
            <div className="feature-card-icon">
              <Zap size={18} />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">Lightning Fast</h3>
              <p className="feature-card-desc">Sub-second retrieval &amp; seeks</p>
            </div>
            <ChevronRight size={15} className="feature-card-chevron" />
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Lock size={18} />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">100% Private</h3>
              <p className="feature-card-desc">All models run on your machine</p>
            </div>
            <ChevronRight size={15} className="feature-card-chevron" />
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Cpu size={18} />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">Advanced AI</h3>
              <p className="feature-card-desc">Whisper + Dense Embeddings + PCA</p>
            </div>
            <ChevronRight size={15} className="feature-card-chevron" />
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <LayoutGrid size={18} />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">Verified Citations</h3>
              <p className="feature-card-desc">Zero hallucinations, exact moments</p>
            </div>
            <ChevronRight size={15} className="feature-card-chevron" />
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. ABOUT ARC — THE PROBLEM IT SOLVES
          ==================================================================== */}
      <section className="luxury-section" id="about">
        <div className="section-head-luxury">
          <span className="luxury-eyebrow">THE INFORMATION PARADOX</span>
          <h2>Unlocking Knowledge Trapped in Video.</h2>
          <p>
            Over 80% of digital information is recorded as video — lectures, keynotes, meetings, tutorials.
            Yet video remains fundamentally opaque, non-linear, and difficult to search.
          </p>
        </div>

        <div className="problem-solution-grid">
          <div className="problem-solution-card">
            <div className="card-glyph-badge warning">
              <Clock size={20} />
            </div>
            <h3>The Scrubbing Fatigue</h3>
            <p>
              Finding one key concept inside a two-hour lecture requires endless scrubbing and guessing.
              Traditional players treat video as a dumb byte stream with no semantic awareness.
            </p>
          </div>

          <div className="problem-solution-card featured">
            <div className="card-glyph-badge gold">
              <Sparkles size={20} />
            </div>
            <h3>The ARC Intelligence Layer</h3>
            <p>
              ARC extracts speech, embeds semantic meaning into 384-dimensional vector space, clusters topics
              unsupervised via K-Means and PCA, and synthesizes structured takeaways with instant timestamps.
            </p>
          </div>

          <div className="problem-solution-card">
            <div className="card-glyph-badge success">
              <ShieldCheck size={20} />
            </div>
            <h3>Sovereign Local Privacy</h3>
            <p>
              Your sensitive corporate recordings, confidential lectures, and personal files never leave your hardware.
              Zero third-party cloud audio transmission, zero telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THE 7-STAGE INTELLIGENCE PIPELINE ("How It Works")
          ==================================================================== */}
      <section className="luxury-section" id="pipeline">
        <div className="section-head-luxury">
          <span className="luxury-eyebrow">PROCESSING PIPELINE</span>
          <h2>From Raw Moving Image to Grounded Intelligence.</h2>
          <p>
            Every video passes through seven mathematically defined intelligence stages on your local machine.
          </p>
        </div>

        <div className="pipeline-track-luxury">
          {[
            { num: '01', name: 'Video Ingest', desc: 'Secure local acquisition of MP4, MOV, WebM or YouTube streams.' },
            { num: '02', name: 'Audio Extraction', desc: 'High-fidelity audio stream isolation via on-device FFmpeg.' },
            { num: '03', name: 'Whisper Transcription', desc: 'Sub-second word alignment with English, Hindi, & Marathi translation.' },
            { num: '04', name: 'Structural Coherence', desc: 'Natural boundary detection and semantic sentence chunking.' },
            { num: '05', name: 'Dense Embeddings', desc: 'SentenceTransformers project text into 384-dimensional geometric space.' },
            { num: '06', name: 'Unsupervised Topics', desc: 'K-Means clustering and PCA 2D projection reveal organic themes.' },
            { num: '07', name: 'Grounded Synthesis', desc: 'Executive summaries, chapters, and Q&A with exact second citations.' },
          ].map((stage, i) => (
            <div key={i} className="pipeline-step-card">
              <div className="step-num">{stage.num}</div>
              <h4 className="step-name">{stage.name}</h4>
              <p className="step-desc">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          5. CORE CAPABILITIES INTERACTIVE SHOWCASE
          ==================================================================== */}
      <section className="luxury-section" id="capabilities">
        <div className="section-head-luxury">
          <span className="luxury-eyebrow">CORE CAPABILITIES</span>
          <h2>Experience the Intelligence Engine in Action.</h2>
          <p>
            Interactive demonstration of ARC&apos;s four core intelligence pillars. Click between tabs to explore the real algorithms.
          </p>
        </div>

        {/* Showcase Stage Selector Tabs */}
        <div className="showcase-tabs" role="tablist" aria-label="ARC Capabilities">
          <button
            type="button"
            role="tab"
            aria-selected={showcaseTab === 'speech'}
            className={`showcase-tab ${showcaseTab === 'speech' ? 'active' : ''}`}
            onClick={() => setShowcaseTab('speech')}
          >
            <AudioWaveform size={15} />
            <span>01 Multilingual Whisper</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={showcaseTab === 'chapters'}
            className={`showcase-tab ${showcaseTab === 'chapters' ? 'active' : ''}`}
            onClick={() => setShowcaseTab('chapters')}
          >
            <Layers size={15} />
            <span>02 Smart Chapters</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={showcaseTab === 'clusters'}
            className={`showcase-tab ${showcaseTab === 'clusters' ? 'active' : ''}`}
            onClick={() => setShowcaseTab('clusters')}
          >
            <Network size={15} />
            <span>03 Semantic Topics (PCA)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={showcaseTab === 'qa'}
            className={`showcase-tab ${showcaseTab === 'qa' ? 'active' : ''}`}
            onClick={() => setShowcaseTab('qa')}
          >
            <MessageSquare size={15} />
            <span>04 Evidence-Grounded Q&amp;A</span>
          </button>
        </div>

        {/* Dynamic Interactive Visual Stage Container */}
        <div className="showcase-display-card">
          {showcaseTab === 'speech' && (
            <div className="showcase-stage-grid">
              <div className="stage-info">
                <span className="stage-tag">STAGE 01 · ON-DEVICE SPEECH</span>
                <h3>Listen &amp; Transcribe in Any Tongue</h3>
                <p>
                  High-accuracy automatic speech recognition (ASR) extracts every syllable with exact word-level start and end timestamps. Native support for English, Hindi, and Marathi with automatic cross-lingual translation.
                </p>
                <div className="stage-features">
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Sub-second timestamp precision for instant seeking</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Automatic Marathi (मराठी) &amp; Hindi (हिन्दी) translation to English</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>100% on-device Whisper model — zero cloud audio transmission</span>
                  </div>
                </div>

                <div className="lang-interactive-picker">
                  <span className="picker-label">Test Language Alignment:</span>
                  <div className="lang-pills">
                    <button
                      type="button"
                      className={`lang-pill ${demoLang === 'en' ? 'active' : ''}`}
                      onClick={() => setDemoLang('en')}
                    >
                      English (Original)
                    </button>
                    <button
                      type="button"
                      className={`lang-pill ${demoLang === 'mr' ? 'active' : ''}`}
                      onClick={() => setDemoLang('mr')}
                    >
                      मराठी (Marathi)
                    </button>
                    <button
                      type="button"
                      className={`lang-pill ${demoLang === 'hi' ? 'active' : ''}`}
                      onClick={() => setDemoLang('hi')}
                    >
                      हिन्दी (Hindi)
                    </button>
                  </div>
                </div>
              </div>

              <div className="stage-visual">
                <div className="visual-waveform-card">
                  <div className="waveform-header">
                    <div className="live-rec-indicator">
                      <span className="rec-pulse-dot" />
                      <span>LIVE AUDIO STREAM</span>
                    </div>
                    <span className="waveform-time">00:12 / 02:45</span>
                  </div>

                  {/* Animated Waveform Visualizer */}
                  <div className="animated-waveform-bars" aria-hidden="true">
                    {[18, 30, 45, 68, 36, 54, 80, 94, 62, 46, 72, 88, 40, 58, 70, 50, 82, 64, 38, 22].map((h, i) => (
                      <div
                        key={i}
                        className="wave-bar"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${(i * 0.07).toFixed(2)}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Dynamic Transcript Stream Display */}
                  <div className="live-transcript-box">
                    <div className="transcript-sync-badge">
                      <Clock size={12} />
                      <span>00:12 — 00:22</span>
                    </div>
                    <p className="transcript-live-text">
                      {demoLang === 'en' && (
                        <>
                          <span className="word-spoken">“Vectors</span>{' '}
                          <span className="word-spoken active-word">represent</span>{' '}
                          <span className="word-spoken">semantic</span>{' '}
                          <span className="word-spoken">meaning</span>{' '}
                          <span className="word-spoken">across</span>{' '}
                          <span className="word-spoken">high-dimensional</span>{' '}
                          <span className="word-spoken">latent</span>{' '}
                          <span className="word-spoken">spaces.”</span>
                        </>
                      )}
                      {demoLang === 'mr' && (
                        <>
                          <span className="word-spoken">“व्हॅक्टर्स</span>{' '}
                          <span className="word-spoken active-word">अर्थपूर्ण</span>{' '}
                          <span className="word-spoken">संकल्पनांचे</span>{' '}
                          <span className="word-spoken">उच्च-आयामी</span>{' '}
                          <span className="word-spoken">अवकाशात</span>{' '}
                          <span className="word-spoken">प्रतिनिधित्व</span>{' '}
                          <span className="word-spoken">करतात.”</span>
                        </>
                      )}
                      {demoLang === 'hi' && (
                        <>
                          <span className="word-spoken">“वेक्टर</span>{' '}
                          <span className="word-spoken active-word">उच्च-आयामी</span>{' '}
                          <span className="word-spoken">स्थान</span>{' '}
                          <span className="word-spoken">में</span>{' '}
                          <span className="word-spoken">अर्थपूर्ण</span>{' '}
                          <span className="word-spoken">भावों</span>{' '}
                          <span className="word-spoken">का</span>{' '}
                          <span className="word-spoken">प्रतिनिधित्व</span>{' '}
                          <span className="word-spoken">करते</span>{' '}
                          <span className="word-spoken">हैं।”</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showcaseTab === 'chapters' && (
            <div className="showcase-stage-grid">
              <div className="stage-info">
                <span className="stage-tag">STAGE 02 · HIERARCHICAL REASONING</span>
                <h3>Structure &amp; Timeline Synthesis</h3>
                <p>
                  Long videos contain natural thematic shifts. ARC detects transition boundaries, generating hierarchical summaries, key takeaways, and jumpable chapters with preview timestamps.
                </p>
                <div className="stage-features">
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Automatic boundary detection based on semantic coherence</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Actionable executive takeaways distilled from full transcripts</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>One-click seeking to any chapter moment in the video</span>
                  </div>
                </div>
              </div>

              <div className="stage-visual">
                <div className="visual-timeline-card">
                  <div className="timeline-header">
                    <span className="timeline-title">Detected Timeline Chapters</span>
                    <span className="timeline-count">4 Chapters</span>
                  </div>

                  {/* Interactive Chapter Timeline Scrubber */}
                  <div className="timeline-scrubber" aria-hidden="true">
                    <div className={`scrubber-segment ${activeChapterIndex === 0 ? 'active' : ''}`} onClick={() => setActiveChapterIndex(0)} />
                    <div className={`scrubber-segment ${activeChapterIndex === 1 ? 'active' : ''}`} onClick={() => setActiveChapterIndex(1)} />
                    <div className={`scrubber-segment ${activeChapterIndex === 2 ? 'active' : ''}`} onClick={() => setActiveChapterIndex(2)} />
                    <div className={`scrubber-segment ${activeChapterIndex === 3 ? 'active' : ''}`} onClick={() => setActiveChapterIndex(3)} />
                  </div>

                  {/* Chapter List */}
                  <div className="chapters-interactive-list">
                    {[
                      { time: '00:00', title: 'Introduction to Semantic Retrieval', desc: 'Overview of dense vector representations and text embeddings.' },
                      { time: '01:45', title: 'Dimensionality & Coordinate Spaces', desc: 'Projecting high-dimensional spaces to 2D Cartesian planes via PCA.' },
                      { time: '04:12', title: 'K-Means Clustering Algorithms', desc: 'Grouping related concepts without pre-labeled categories.' },
                      { time: '07:30', title: 'Evidence-Grounded Synthesis', desc: 'Synthesizing takeaways with verifiable timestamp citations.' },
                    ].map((ch, idx) => (
                      <div
                        key={idx}
                        className={`interactive-chapter-item ${activeChapterIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveChapterIndex(idx)}
                      >
                        <span className="chapter-timestamp">{ch.time}</span>
                        <div className="chapter-meta">
                          <strong className="chapter-heading">{ch.title}</strong>
                          <span className="chapter-summary">{ch.desc}</span>
                        </div>
                        <PlayCircle size={16} className="chapter-seek-icon" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showcaseTab === 'clusters' && (
            <div className="showcase-stage-grid">
              <div className="stage-info">
                <span className="stage-tag">STAGE 03 · UNSUPERVISED ML</span>
                <h3>Semantic Topics · K-Means &amp; PCA</h3>
                <p>
                  No hand-labeled categories required. ARC embeds transcript chunks into high-dimensional vector space, clusters them with K-Means, and projects them to 2D coordinates with Principal Component Analysis (PCA).
                </p>
                <div className="stage-features">
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Dense sentence transformers generate 384-dimensional embeddings</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>K-Means discovers organic topic clusters without supervision</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>PCA 2D projection provides an intuitive visual coordinate map</span>
                  </div>
                </div>
              </div>

              <div className="stage-visual">
                <div className="visual-cluster-card">
                  <div className="cluster-header">
                    <span className="cluster-badge">2D PCA SEMANTIC SPACE</span>
                    <span className="cluster-metrics">k=3 · Silhouette: 0.78</span>
                  </div>

                  {/* SVG 2D Radar Cluster Visualization */}
                  <div className="cluster-svg-wrap">
                    <svg viewBox="0 0 320 200" className="cluster-svg" aria-label="Topic Cluster Map">
                      <line x1="160" y1="10" x2="160" y2="190" stroke="var(--line)" strokeDasharray="3 3" />
                      <line x1="10" y1="100" x2="310" y2="100" stroke="var(--line)" strokeDasharray="3 3" />
                      
                      <g className="cluster-group c1">
                        <line x1="85" y1="55" x2="60" y2="40" stroke="var(--accent)" strokeOpacity="0.3" />
                        <line x1="85" y1="55" x2="110" y2="45" stroke="var(--accent)" strokeOpacity="0.3" />
                        <line x1="85" y1="55" x2="75" y2="75" stroke="var(--accent)" strokeOpacity="0.3" />
                        <circle cx="60" cy="40" r="4" fill="var(--accent)" opacity="0.7" />
                        <circle cx="110" cy="45" r="4" fill="var(--accent)" opacity="0.7" />
                        <circle cx="75" cy="75" r="4" fill="var(--accent)" opacity="0.7" />
                        <circle cx="85" cy="55" r="7" fill="var(--accent)" className="centroid-pulse" />
                        <text x="85" y="30" fill="var(--text)" fontSize="10" fontWeight="600" textAnchor="middle">
                          Vector Retrieval
                        </text>
                      </g>

                      <g className="cluster-group c2">
                        <line x1="230" y1="65" x2="205" y2="50" stroke="var(--success)" strokeOpacity="0.3" />
                        <line x1="230" y1="65" x2="250" y2="80" stroke="var(--success)" strokeOpacity="0.3" />
                        <line x1="230" y1="65" x2="215" y2="85" stroke="var(--success)" strokeOpacity="0.3" />
                        <circle cx="205" cy="50" r="4" fill="var(--success)" opacity="0.7" />
                        <circle cx="250" cy="80" r="4" fill="var(--success)" opacity="0.7" />
                        <circle cx="215" cy="85" r="4" fill="var(--success)" opacity="0.7" />
                        <circle cx="230" cy="65" r="7" fill="var(--success)" className="centroid-pulse" />
                        <text x="230" y="42" fill="var(--text)" fontSize="10" fontWeight="600" textAnchor="middle">
                          Whisper ASR
                        </text>
                      </g>

                      <g className="cluster-group c3">
                        <line x1="160" y1="150" x2="130" y2="165" stroke="var(--warning)" strokeOpacity="0.3" />
                        <line x1="160" y1="150" x2="190" y2="160" stroke="var(--warning)" strokeOpacity="0.3" />
                        <line x1="160" y1="150" x2="150" y2="130" stroke="var(--warning)" strokeOpacity="0.3" />
                        <circle cx="130" cy="165" r="4" fill="var(--warning)" opacity="0.7" />
                        <circle cx="190" cy="160" r="4" fill="var(--warning)" opacity="0.7" />
                        <circle cx="150" cy="130" r="4" fill="var(--warning)" opacity="0.7" />
                        <circle cx="160" cy="150" r="7" fill="var(--warning)" className="centroid-pulse" />
                        <text x="160" y="180" fill="var(--text)" fontSize="10" fontWeight="600" textAnchor="middle">
                          Structured Synthesis
                        </text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showcaseTab === 'qa' && (
            <div className="showcase-stage-grid">
              <div className="stage-info">
                <span className="stage-tag">STAGE 04 · CITATION VERIFICATION</span>
                <h3>Evidence-Grounded Video Q&amp;A</h3>
                <p>
                  Chat with the video. Every response references verifiable timestamps from the spoken audio. Click any citation chip to seek video playback directly to that second.
                </p>
                <div className="stage-features">
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Every claim is backed by exact timestamp evidence chips</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Target questions to a specific time range (e.g. 02:00 to 05:00)</span>
                  </div>
                  <div className="feature-bullet">
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Zero hallucinations: answers only with what was spoken in the video</span>
                  </div>
                </div>
              </div>

              <div className="stage-visual">
                <div className="visual-chat-card">
                  <div className="chat-header">
                    <div className="chat-agent-pill">
                      <Bot size={14} color="var(--accent)" />
                      <span>ARC Intelligence Agent</span>
                    </div>
                    <span className="strict-evidence-tag">Strict Evidence Active</span>
                  </div>

                  <div className="chat-conversation-flow">
                    <div className="demo-chat-bubble user">
                      <span className="bubble-sender">You</span>
                      <p>How does vector search find matching concepts?</p>
                    </div>

                    <div className="demo-chat-bubble assistant">
                      <span className="bubble-sender">ARC</span>
                      <p>
                        Vector search projects spoken phrases into geometric latent space, comparing cosine distances rather than matching exact keywords.
                      </p>
                      <div className="citation-chips-row">
                        <button
                          type="button"
                          className="demo-citation-pill"
                          onClick={() => setCitationModalOpen(!citationModalOpen)}
                        >
                          <Clock size={12} />
                          <span>00:12</span>
                          <span className="citation-hint">Click to inspect</span>
                        </button>
                      </div>

                      {citationModalOpen && (
                        <div className="demo-source-modal-preview">
                          <strong>Source Moment [00:12 — 00:22]</strong>
                          <p>“Vectors represent semantic meaning across multi-dimensional embedding space.”</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          6. SYSTEM ARCHITECTURE & ON-DEVICE SOVEREIGNTY
          ==================================================================== */}
      <section className="luxury-section" id="architecture">
        <div className="section-head-luxury">
          <span className="luxury-eyebrow">SYSTEM ARCHITECTURE</span>
          <h2>Local-First Infrastructure. Sovereign by Design.</h2>
          <p>
            No third-party video storage. All intermediate tensors, audio tracks, and databases remain strictly inside your environment.
          </p>
        </div>

        <div className="architecture-grid">
          <div className="arch-card">
            <div className="arch-icon-wrap">
              <HardDrive size={22} />
            </div>
            <h4>On-Device Whisper Engine</h4>
            <p>
              Local PyTorch/Whisper models transcribe speech without communicating with cloud APIs, preserving privacy for proprietary recordings.
            </p>
            <div className="arch-meta-tag">OpenAI Whisper Small / Base</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon-wrap">
              <Network size={22} />
            </div>
            <h4>Vector Embedding Space</h4>
            <p>
              Dense sentence transformers convert transcript passages into 384-dimensional geometric vectors with cosine similarity metrics.
            </p>
            <div className="arch-meta-tag">SentenceTransformers (all-MiniLM-L6-v2)</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon-wrap">
              <Database size={22} />
            </div>
            <h4>ChromaDB &amp; SQLite</h4>
            <p>
              Local persistent ChromaDB collections store embeddings while SQLite maintains normalized video, chapter, and transcript entities.
            </p>
            <div className="arch-meta-tag">SQLite + Chroma Vector Store</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon-wrap">
              <Search size={22} />
            </div>
            <h4>Verifiable Evidence Retrieval</h4>
            <p>
              Every synthesis query performs vector nearest-neighbor lookups with exact start/end seconds so every claim can be audited.
            </p>
            <div className="arch-meta-tag">Zero-Hallucination Retrieval</div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. RECENT ANALYSES LIBRARY GRID (if videos exist)
          ==================================================================== */}
      {videos.length > 0 && (
        <section className="luxury-section" id="recent">
          <div className="section-head-luxury">
            <span className="luxury-eyebrow">SAVED WORKSPACES</span>
            <h2>Recent Video Analyses</h2>
            <p>Jump back into your previously processed videos.</p>
          </div>
          <div className="recent-grid">
            {videos.slice(0, 3).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          8. LUXURY FINAL CTA & FOOTER
          ==================================================================== */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <span className="luxury-eyebrow">READY TO TRANSFORM YOUR WORKFLOW?</span>
          <h2>Experience the Future of Video Intelligence.</h2>
          <p>
            Make every hour of video understandable, searchable, and addressable in seconds.
          </p>
          <button
            type="button"
            className="champagne-pill-btn"
            onClick={handleHeroUploadClick}
          >
            <span>ENTER WORKSPACE NOW</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Luxury Minimal Footer */}
      <footer className="luxury-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-monogram">A R C</span>
            <span className="footer-tagline">Video Intelligence Platform</span>
          </div>
          <div className="footer-nav">
            <button type="button" onClick={() => scrollToSection('hero')}>Overview</button>
            <button type="button" onClick={() => scrollToSection('ingest-workspace')}>Workspace</button>
            <button type="button" onClick={() => scrollToSection('pipeline')}>Pipeline</button>
            <button type="button" onClick={() => scrollToSection('capabilities')}>Capabilities</button>
            <button type="button" onClick={() => scrollToSection('architecture')}>Architecture</button>
            <Link href="/library">Saved Library</Link>
            <Link href="/settings">Platform Preferences</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} ARC. Built for creators. Sovereign &amp; local-first.</span>
          <span className="footer-status-pill">Local Engine 100% Operational</span>
        </div>
      </footer>
    </div>
  );
}
