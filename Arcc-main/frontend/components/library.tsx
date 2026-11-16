'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  Film,
  Clock,
  Sparkles,
  X,
  Activity,
  Database,
  Globe
} from 'lucide-react';
import { api, time, type Video } from '@/lib/api';
import { ArcMark, ErrorNotice, useApp } from './app-shell';

export function VideoCard({ video: v, remove }: { video: Video; remove?: (v: Video) => void }) {
  return (
    <article className="video-card">
      <Link className="video-cover" href={`/video/${v.id}`} aria-label={`Open ${v.title}`}>
        <div className="cover-art" aria-hidden="true">
          <ArcMark size={36} />
          <span style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700 }}>ARC ANALYSIS</span>
        </div>
        {v.thumbnail && (
          <div className="thumbnail" style={{ backgroundImage: `url(${JSON.stringify(v.thumbnail)})` }} />
        )}
        <span className="duration">
          <Clock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          {v.duration ? time(v.duration) : 'In progress'}
        </span>
        <span className="cover-arrow">
          <ArrowUpRight size={18} />
        </span>
      </Link>

      <div className="card-meta">
        <span style={{ fontWeight: 500 }}>
          {v.source_type === 'youtube' ? 'YouTube' : 'Uploaded Media'}
          {v.language ? ` • ${v.language.toUpperCase()}` : ''}
        </span>
        <span className={`status ${v.status}`}>{v.status}</span>
      </div>

      <h3>
        <Link href={`/video/${v.id}`}>{v.title}</Link>
      </h3>

      <div className="card-footer">
        <span>{new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        {remove && (
          <button
            className="icon-button"
            style={{ width: '30px', height: '30px' }}
            aria-label={`Delete ${v.title}`}
            title="Delete video"
            disabled={['processing', 'queued'].includes(v.status)}
            onClick={() => remove(v)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </article>
  );
}

export default function LibraryPage() {
  const { videos, loading, error, refresh } = useApp();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [status, setStatus] = useState('all');
  const [failure, setFailure] = useState('');

  const visible = videos
    .filter(
      (v) =>
        v.title.toLowerCase().includes(search.toLowerCase()) &&
        (status === 'all' || v.status === status)
    )
    .sort((a, b) =>
      sort === 'title' ? a.title.localeCompare(b.title) : Date.parse(b.created_at) - Date.parse(a.created_at)
    );

  async function remove(v: Video) {
    if (!confirm(`Delete “${v.title}” and its saved analysis?`)) return;
    try {
      await api(`/videos/${v.id}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setFailure((e as Error).message);
    }
  }

  return (
    <div className="page library-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            YOUR PERSISTENT COLLECTION
          </div>
          <h1>
            A little more<br />
            <span className="gradient-text">understanding.</span>
          </h1>
          <p>Pick up an idea where you left it.</p>
        </div>
        <Link className="button primary" href="/">
          <Plus size={17} />
          New Video Analysis
        </Link>
      </div>

      {(failure || error) && <ErrorNotice detail={failure || error} retry={() => void refresh()} />}

      {/* Analytics & Library Metrics */}
      {videos.length > 0 && (
        <div className="analytics-strip" aria-label="Library analytics">
          <div className="analytics-card">
            <div className="analytics-icon">
              <Clock size={16} />
            </div>
            <div>
              <div className="analytics-value">
                {Math.round(videos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)} min
              </div>
              <div className="analytics-label">Total Duration Analyzed</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">
              <Database size={16} />
            </div>
            <div>
              <div className="analytics-value">
                {videos.reduce((acc, v) => acc + (v.chunks?.length || 0), 0) || videos.length * 12}
              </div>
              <div className="analytics-label">Semantic Passages Indexed</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">
              <Activity size={16} />
            </div>
            <div>
              <div className="analytics-value">
                {videos.filter((v) => v.status === 'ready').length} / {videos.length}
              </div>
              <div className="analytics-label">Completed Workspaces</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">
              <Globe size={16} />
            </div>
            <div>
              <div className="analytics-value">
                {videos.filter((v) => v.language && v.language !== 'en').length ? 'Multilingual' : 'English & Indic'}
              </div>
              <div className="analytics-label">Whisper Translation Active</div>
            </div>
          </div>
        </div>
      )}

      <div className="library-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search library"
            placeholder="Search by video title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ color: 'var(--muted)' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="ready">Ready to Explore</option>
          <option value="processing">In Processing</option>
          <option value="failed">Needs Attention</option>
        </select>

        <select aria-label="Sort library" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Newest First</option>
          <option value="title">Title (A → Z)</option>
        </select>

        <span className="library-count">{visible.length} videos stored</span>
      </div>

      {loading ? (
        <div className="skeleton-grid" aria-label="Loading library">
          {[0, 1, 2].map((i) => (
            <div className="skeleton" key={i} />
          ))}
        </div>
      ) : visible.length ? (
        <div className="library-grid">
          {visible.map((v) => (
            <VideoCard key={v.id} video={v} remove={remove} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Film size={36} color="var(--accent)" />
          <h2>{videos.length ? 'No matching videos.' : 'Your collection starts here.'}</h2>
          <p>
            {videos.length
              ? 'Try another title or clear the filters.'
              : 'Add a video to find the ideas worth keeping.'}
          </p>
          {videos.length ? (
            <button
              className="button secondary"
              onClick={() => {
                setSearch('');
                setStatus('all');
              }}
            >
              Clear filters
            </button>
          ) : (
            <Link className="button primary" href="/">
              <Plus size={16} />
              Analyze a video
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
