'use client';

import { Check, CircleHelp, Shield, Cpu, Palette, Sparkles, RefreshCw } from 'lucide-react';
import { ThemeControl, ErrorNotice, useApp } from '@/components/app-shell';

export default function SettingsPage() {
  const { settings, error, refresh } = useApp();

  return (
    <div className="page settings-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            WORKSPACE PREFERENCES
          </div>
          <h1>
            System &amp; <span className="gradient-text">Settings.</span>
          </h1>
          <p className="page-description">Configure your local processing engine, language models, and appearance.</p>
        </div>
        <button className="button secondary" onClick={() => void refresh()}>
          <RefreshCw size={15} />
          Refresh Status
        </button>
      </div>

      {error && <ErrorNotice detail={error} retry={() => void refresh()} />}

      {/* Appearance Section */}
      <section className="settings-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Palette size={18} color="var(--accent)" />
            <h2>Interface Appearance</h2>
          </div>
          <p>Switch between warm light, deep dark obsidian, or synchronize automatically with your operating system.</p>
        </div>
        <div>
          <ThemeControl />
        </div>
      </section>

      {/* Analysis Connection Section */}
      <section className="settings-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h2>Analysis &amp; LLM Provider</h2>
          </div>
          <p>
            Topic labels, hierarchical summaries, and grounded Q&amp;A use your configured OpenRouter or custom LLM route.
          </p>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              className="status"
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: settings?.deepseek_configured ? 'var(--success-light)' : 'var(--warning-light)',
                color: settings?.deepseek_configured ? 'var(--success)' : 'var(--warning)',
              }}
            >
              {settings ? (
                settings.deepseek_configured ? (
                  <>
                    <Check size={15} strokeWidth={2.5} /> Engine Connected
                  </>
                ) : (
                  <>
                    <CircleHelp size={15} /> Setup Required
                  </>
                )
              ) : (
                'Checking connection…'
              )}
            </span>
          </div>

          <details className="technical-details" open style={{ marginTop: '10px' }}>
            <summary>Active Provider Configuration</summary>
            <p>
              <strong>Configured Model:</strong> {settings?.deepseek_model || 'Not available'}
            </p>
            <p style={{ marginTop: '8px' }}>
              Your key is stored securely in <code>backend/.env</code> and never exposed to client browsers.
            </p>
          </details>
        </div>
      </section>

      {/* Local Processing Engine */}
      <section className="settings-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={18} color="var(--accent)" />
            <h2>On-Device Processing</h2>
          </div>
          <p>
            Speech recognition, audio extraction, vector embeddings, and topic clustering execute directly on your hardware.
          </p>
        </div>
        <dl>
          <div>
            <dt>Speech Recognition Engine</dt>
            <dd>Whisper ({settings?.whisper_model || 'small'} model)</dd>
          </div>
          <div>
            <dt>Media Acceleration (FFmpeg)</dt>
            <dd style={{ color: settings?.ffmpeg_available ? 'var(--success)' : 'var(--danger)' }}>
              {settings ? (settings.ffmpeg_available ? 'Hardware Ready' : 'Unavailable') : '—'}
            </dd>
          </div>
          <div>
            <dt>Max Ingest File Size</dt>
            <dd>{settings?.max_upload_mb || '—'} MB</dd>
          </div>
          <div>
            <dt>Vector Database</dt>
            <dd>Chroma (Persistent on-device storage)</dd>
          </div>
        </dl>
      </section>

      {/* Privacy Standards */}
      <section className="privacy-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Shield size={20} color="var(--success)" />
          <h2 style={{ fontSize: '22px' }}>Local-First Privacy Architecture</h2>
        </div>
        <p>
          Your video files, raw audio tracks, Whisper transcripts, vector embeddings, and conversation histories are stored
          locally on this machine. Only bounded transcript context is shared with your chosen model provider when generating
          summaries or answering grounded chat queries.
        </p>
      </section>
    </div>
  );
}
