'use client';

import { useState } from 'react';
import {
  Download,
  Search,
  Languages,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { api, time, type Segment, type Video } from '@/lib/api';
import { ErrorNotice } from './app-shell';

export function Transcript({
  video,
  seek,
  onRefresh,
}: {
  video: Video;
  seek: (start: number) => void;
  onRefresh: () => void;
}) {
  const [view, setView] = useState<'english' | 'original' | 'both'>('english');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const segments = video.transcript || [];
  const source =
    video.language === 'mr' ? 'Marathi' : video.language === 'hi' ? 'Hindi' : video.language?.toUpperCase() || 'Original';
  const bilingual = ['hi', 'mr'].includes(video.language || '');
  const pending = bilingual && segments.some((s) => s.translation_language !== 'en');

  function original(s: Segment) {
    return s.original_text ?? s.text;
  }

  function english(s: Segment) {
    return bilingual && s.translation_language !== 'en' ? '' : s.text;
  }

  const visible = segments.filter((s) =>
    [...(view !== 'english' ? [original(s)] : []), ...(view !== 'original' ? [english(s)] : [])].some((text) =>
      text.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    )
  );

  async function translate() {
    setBusy(true);
    setError('');
    try {
      await api(`/videos/${video.id}/translate`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const text = segments
      .map(
        (s) =>
          `[${time(s.start)} – ${time(s.end)}]\n` +
          (view === 'original'
            ? original(s)
            : view === 'both'
            ? `${english(s) || '[English translation pending]'}\n${original(s)}`
            : english(s) || '[English translation pending]')
      )
      .join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `arc-${video.id}-${view}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!segments.length) {
    return (
      <div className="content-empty">
        <Languages size={28} color="var(--accent)" />
        <p>Your timestamped transcript will appear here once audio transcription finishes.</p>
      </div>
    );
  }

  return (
    <section aria-label="Video transcript">
      {error && <ErrorNotice detail={error} />}

      {/* Primary Toolbar */}
      <div className="content-toolbar transcript-controls">
        {bilingual ? (
          <div className="segmented" role="group" aria-label="Transcript language">
            {(['english', 'original', 'both'] as const).map((value) => (
              <button
                key={value}
                className={view === value ? 'selected' : ''}
                aria-pressed={view === value}
                onClick={() => setView(value)}
              >
                {value === 'english' ? 'English' : value === 'original' ? `Original (${source})` : 'Both'}
              </button>
            ))}
          </div>
        ) : (
          <span className="eyebrow" style={{ margin: 0 }}>
            {segments.length} SYNCHRONIZED PASSAGES
          </span>
        )}

        <button className="button secondary" onClick={download}>
          <Download size={15} />
          Download transcript
        </button>
      </div>

      {bilingual && (
        <p className="muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
          {source} speech recognition • English translation preserved for retrieval • Identical original audio timestamps.
        </p>
      )}

      {pending && (
        <div className="translation-notice">
          <p>
            English translation is pending for this video. The original {source} transcript is saved and searchable below.
          </p>
          {!['queued', 'processing'].includes(video.status) && (
            <button className="button primary" disabled={busy} onClick={translate} style={{ marginTop: '12px' }}>
              <RotateCcw size={15} className={busy ? 'spin' : ''} />
              {busy ? 'Translating via LLM…' : 'Translate to English'}
            </button>
          )}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="content-toolbar" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            className="search-input"
            style={{ width: '100%', paddingLeft: '34px', paddingRight: search ? '30px' : '12px' }}
            aria-label="Search transcript"
            placeholder="Search within transcript…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--muted)' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <span className="muted" style={{ fontSize: '12.5px', fontWeight: 600 }}>
          {visible.length} of {segments.length} segments matching
        </span>
      </div>

      {!visible.length && (
        <div className="content-empty" style={{ padding: '36px 0' }}>
          <p className="muted">
            No matching passages. Try a different word.
            {bilingual && ' You can also switch transcript language.'}
          </p>
        </div>
      )}

      {/* Transcript List */}
      <div className="transcript">
        {visible.map((s) => (
          <div key={`${s.start}:${s.end}`}>
            <button className="timestamp" onClick={() => seek(s.start)} title="Jump video to this moment">
              <Play size={11} fill="currentColor" />
              {time(s.start)}
            </button>
            <div className="transcript-wording">
              {view !== 'original' && (
                <p lang={bilingual ? 'en' : video.language} style={{ fontWeight: 450 }}>
                  {english(s) || <span className="muted">English translation pending.</span>}
                </p>
              )}
              {view !== 'english' && (
                <p
                  lang={video.language}
                  className={view === 'both' ? 'original-speech' : undefined}
                  style={view === 'both' ? { opacity: 0.85, fontSize: '14px', marginTop: '6px' } : undefined}
                >
                  {original(s)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
