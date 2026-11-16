'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Clock,
  Sparkles,
  Tag
} from 'lucide-react';
import { type Video, time, type Section } from '@/lib/api';
import { Transcript } from './transcript';
import { Player, type PlayerHandle } from './player';
import { sections, ErrorNotice } from './app-shell';

function Sections({ items }: { items: Section[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((s, i) => (
        <section className="text-section" key={i}>
          <h3>{s.title}</h3>
          <p>{s.content}</p>
        </section>
      ))}
    </div>
  );
}

const colors = ['#818cf8', '#60a5fa', '#c084fc', '#f472b6', '#fbbf24', '#34d399', '#fb7185', '#38bdf8'];

export default function Workspace({
  video,
  section,
  onRefresh,
}: {
  video: Video;
  section: string;
  onRefresh: () => void;
}) {
  const tab =
    ({
      '': 'Summary',
      summary: 'Summary',
      timeline: 'Timeline',
      transcript: 'Transcript',
      topics: 'Topics',
      notes: 'Study Notes',
    } as Record<string, string>)[section] || 'Summary';

  const [mode, setMode] = useState<'Quick' | 'Detailed'>('Quick');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const player = useRef<PlayerHandle>(null);
  const playerWrap = useRef<HTMLDivElement>(null);
  const analysis = video.analysis;
  const ml = video.ml;

  function seek(n: number) {
    player.current?.seek(n);
    playerWrap.current?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access was denied.');
    }
  }

  return (
    <div className="page workspace">
      {/* Workspace Header */}
      <div className="workspace-heading">
        <div className="eyebrow">
          <Sparkles size={14} />
          INTELLIGENCE WORKSPACE
        </div>
        <h1>{video.title}</h1>
        <div className="video-meta">
          <span>{video.source_type === 'youtube' ? 'YouTube' : 'Local File Upload'}</span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} />
            {time(video.duration || 0)}
          </span>
          {video.language && (
            <>
              <span>•</span>
              <span className="eyebrow-badge" style={{ padding: '2px 8px', fontSize: '11px', margin: 0 }}>
                {video.language.toUpperCase()}
              </span>
            </>
          )}
          <span>•</span>
          <span className={`status ${video.status}`}>{video.status}</span>
        </div>
      </div>

      {/* Hero Media Section */}
      <div className="video-hero">
        <div className="video-stage" ref={playerWrap}>
          <Player key={`${video.id}-${video.has_media}`} ref={player} video={video} />
        </div>

        <div className="video-companion">
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>
              SYNCHRONIZED ASSISTANT
            </div>
            <h2>
              Explore Every <br />
              <span className="gradient-text">Dimension.</span>
            </h2>
            <p>
              Jump to precise timestamps, explore emergent machine learning topics, or ask deep questions grounded strictly in this video.
            </p>
          </div>

          <div>
            <Link className="button primary" href={`/video/${video.id}/chat`} style={{ width: '100%', marginBottom: '16px' }}>
              Ask Questions (Grounded Q&amp;A)
              <ArrowUpRight size={17} />
            </Link>

            <div className="video-facts">
              <div>
                <strong>{video.chunks?.length || 0}</strong>
                <span>Indexed Passages</span>
              </div>
              <div style={{ width: '1px', background: 'var(--line)' }} />
              <div>
                <strong>{analysis?.chapters.length || 0}</strong>
                <span>Timestamped Chapters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="video-tabs" aria-label="Video sections">
        {sections.map(({ slug, label, icon: Icon }) => {
          const isCurrent = section === slug || (section === 'summary' && !slug);
          return (
            <Link
              key={slug}
              href={`/video/${video.id}${slug ? '/' + slug : ''}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Main Analysis Body */}
      <div className="analysis-content" key={section}>
        {error && <ErrorNotice detail={error} />}

        {/* SUMMARY TAB */}
        {tab === 'Summary' &&
          (analysis ? (
            <>
              <div className="content-toolbar">
                <div className="segmented">
                  {(['Quick', 'Detailed'] as const).map((m) => (
                    <button
                      className={mode === m ? 'selected' : ''}
                      key={m}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  className="button secondary"
                  title="Copy overview text"
                  aria-label="Copy summary"
                  onClick={() => {
                    void copy(analysis.overview);
                  }}
                  style={{ minHeight: '36px', padding: '6px 14px' }}
                >
                  {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Overview'}</span>
                </button>
              </div>

              <div className="eyebrow">EXECUTIVE OVERVIEW</div>
              <p className="overview">{analysis.overview}</p>

              {mode === 'Detailed' && (
                <div style={{ marginTop: '24px' }}>
                  <div className="eyebrow">DETAILED BREAKDOWN</div>
                  <Sections items={analysis.detailed_summary} />
                </div>
              )}

              <h3 className="subheading">Key Takeaways</h3>
              <ul className="takeaways">
                {analysis.key_takeaways.map((t, i) => (
                  <li key={i}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <p>{t}</p>
                  </li>
                ))}
              </ul>

              {analysis.important_moments.length > 0 && (
                <div style={{ marginTop: '36px' }}>
                  <h3 className="subheading">Worth Revisiting</h3>
                  {analysis.important_moments.map((m, i) => (
                    <button key={i} className="moment-row" onClick={() => seek(m.start)}>
                      <span className="timestamp">{time(m.start)}</span>
                      <span>{m.title}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '36px' }}>
                <h3 className="subheading">Discovered Concepts &amp; Topics</h3>
                <div className="tag-list">
                  {analysis.topics.map((t, i) => (
                    <span key={i}>
                      <Tag size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.entities.length > 0 && (
                <p className="muted" style={{ fontSize: '13px', marginTop: '20px' }}>
                  <strong>Entities &amp; Key Terms:</strong> {analysis.entities.join(' · ')}
                </p>
              )}
            </>
          ) : (
            <Empty text="Your summary will appear after analysis completes. Saved progress is safely kept." />
          ))}

        {/* TIMELINE TAB */}
        {tab === 'Timeline' &&
          (analysis ? (
            <>
              <div className="eyebrow">CHRONOLOGICAL STRUCTURE</div>
              <h2>A Chapter for Every Moment.</h2>
              <div className="timeline">
                {analysis.chapters.map((m, i) => (
                  <button key={i} onClick={() => seek(m.start)}>
                    <span className="timeline-index">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{m.title}</h3>
                      {m.description && <p>{m.description}</p>}
                    </div>
                    <span className="timestamp">{time(m.start)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Empty text="Timeline chapters will appear after the video analysis completes." />
          ))}

        {/* TRANSCRIPT TAB */}
        {tab === 'Transcript' && (
          <Transcript key={video.id} video={video} seek={seek} onRefresh={onRefresh} />
        )}

        {/* STUDY NOTES TAB */}
        {tab === 'Study Notes' &&
          (analysis ? (
            <>
              <div className="content-toolbar">
                <div>
                  <div className="eyebrow">STRUCTURED KNOWLEDGE</div>
                  <h2>Comprehensive Study Notes</h2>
                </div>
                <button
                  className="button secondary"
                  onClick={() =>
                    copy(analysis.study_notes.map((s) => s.title + '\n' + s.content).join('\n\n'))
                  }
                >
                  {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  {copied ? 'Notes Copied' : 'Copy All Notes'}
                </button>
              </div>
              <Sections items={analysis.study_notes} />
            </>
          ) : (
            <Empty text="Study notes will be synthesized once analysis completes." />
          ))}

        {/* TOPICS / ML TAB */}
        {tab === 'Topics' &&
          (ml?.points.length ? (
            <>
              <div className="eyebrow">UNSUPERVISED MACHINE LEARNING</div>
              <h2>Semantic Topic Landscape</h2>
              <p className="muted">
                Sentences are embedded into vector space and partitioned by K-Means clustering with Silhouette validation.
                Click any coordinate or representative moment to jump the video directly to that context.
              </p>

              <div className="topic-cards">
                {ml.topics.map((t) => (
                  <section key={t.cluster_id}>
                    <span className="topic-number" style={{ color: colors[t.cluster_id % colors.length] }}>
                      CLUSTER #{t.cluster_id + 1}
                    </span>
                    <h3>{t.label || `Topic ${t.cluster_id + 1}`}</h3>
                    <div className="citations">
                      {t.representative_chunk_ids.map((id) => {
                        const c = video.chunks?.find((chunk) => chunk.chunk_id === id);
                        return c ? (
                          <button
                            key={id}
                            className="timestamp"
                            title={c.text}
                            onClick={() => seek(c.start)}
                          >
                            <Clock size={12} />
                            {time(c.start)}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="section-heading" style={{ marginTop: '36px', marginBottom: '14px' }}>
                <h3>2D Semantic Projection Map (PCA)</h3>
                <span className="muted" style={{ fontSize: '12px' }}>
                  Interactive: click a point to seek playback
                </span>
              </div>

              <TopicMap video={video} seek={seek} />

              <div className="topic-legend">
                {ml.topics.map((t) => (
                  <span key={t.cluster_id}>
                    <i style={{ background: colors[t.cluster_id % colors.length] }} />
                    {t.label || `Topic ${t.cluster_id + 1}`}
                  </span>
                ))}
              </div>

              <details className="technical-details">
                <summary>Algorithmic &amp; ML Architecture Details</summary>
                <p>
                  <strong>Clustering:</strong> {ml.num_clusters} semantic clusters partitioned via Scikit-Learn K-Means (10 restarts).
                </p>
                <p>
                  <strong>Silhouette Validation:</strong>{' '}
                  {ml.silhouette_score !== null
                    ? `${ml.silhouette_score.toFixed(4)} score indicating separation quality`
                    : 'Single-topic grouping (too few distinct vector partitions)'}
                  .
                </p>
                <p>
                  <strong>Dimensionality Reduction:</strong> Multilingual MiniLM 384-dimensional embeddings projected onto 2D axes via Principal Component Analysis (PCA).
                </p>
                {ml.warning && <p style={{ color: 'var(--warning)' }}>Notice: {ml.warning}</p>}
              </details>
            </>
          ) : (
            <Empty text={ml?.warning || 'Topic clustering will be generated after vector embeddings are computed.'} />
          ))}
      </div>
    </div>
  );
}

function TopicMap({ video, seek }: { video: Video; seek: (n: number) => void }) {
  const points = video.ml!.points;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);

  return (
    <svg className="topic-map" viewBox="0 0 600 300" role="group" aria-label="Interactive topic map">
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--line-light)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <path d="M30 150H570M300 20V280" className="map-axis" />
      {points.map((p) => {
        const cx = maxX === minX ? 300 : 40 + ((p.x - minX) / (maxX - minX)) * 520;
        const cy = maxY === minY ? 150 : 35 + ((p.y - minY) / (maxY - minY)) * 230;
        const color = colors[p.cluster_id % colors.length];
        const topicLabel = video.ml!.topics.find((t) => t.cluster_id === p.cluster_id)?.label || 'Topic';
        const chunkExcerpt = video.chunks?.find((c) => c.chunk_id === p.chunk_id)?.text.slice(0, 160);

        return (
          <g
            key={p.chunk_id}
            role="button"
            tabIndex={0}
            aria-label={`Seek ${time(p.start)}, topic ${p.cluster_id + 1}`}
            onClick={() => seek(p.start)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                seek(p.start);
              }
            }}
          >
            <title>
              {time(p.start)} • {topicLabel}: {chunkExcerpt}...
            </title>
            <circle cx={cx} cy={cy} r="14" fill={color} opacity="0.15" />
            <circle cx={cx} cy={cy} r="7" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="content-empty">
      <BookOpen size={28} strokeWidth={1.5} color="var(--accent)" />
      <p>{text}</p>
    </div>
  );
}
