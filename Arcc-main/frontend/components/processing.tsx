'use client';

import Link from 'next/link';
import {
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileText,
  Boxes,
  Database,
  ArrowUpRight,
  Film,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { api, type Video } from '@/lib/api';
import { ErrorNotice } from './app-shell';

export const stages = [
  { name: 'Video', match: /download|queued|acquir/i, description: 'Fetching video stream and metadata.' },
  { name: 'Audio', match: /extract|playback|audio/i, description: 'Separating the voice track from the visual stream.' },
  {
    name: 'Transcript',
    match: /speech|transcri(?!pt$)bing|translat|model/i,
    description: 'On-device Whisper speech recognition and translation if applicable.',
  },
  { name: 'Structure', match: /structur|chunk/i, description: 'Segmenting dialogue into semantically bounded passages.' },
  { name: 'Embeddings', match: /embedding|vector/i, description: 'Computing high-dimensional multilingual vector embeddings.' },
  { name: 'Topics', match: /discover|k-means|pca|topic/i, description: 'Discovering latent themes via K-Means clustering and PCA projection.' },
  { name: 'Analysis', match: /summary|timeline|analysis|ready/i, description: 'Synthesizing hierarchical summaries, chapters, and key takeaways.' },
];

/* ==========================================================================
   STAGE 01 — Video Acquisition
   Cinematic filmstrip gliding horizontally, viewfinder reticles, laser scanning line
   ========================================================================== */
function VideoAcquisitionVisual({ video }: { video: Video }) {
  return (
    <div className="pipeline-visual visual-video" aria-hidden="true">
      {/* Filmstrip Sprocket Margin Top */}
      <div className="filmstrip-track top">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="sprocket-hole" />
        ))}
      </div>

      {/* Main Viewfinder Frame */}
      <div className="viewfinder-frame">
        <div className="reticle top-left" />
        <div className="reticle top-right" />
        <div className="reticle bottom-left" />
        <div className="reticle bottom-right" />
        <div className="crosshair-center" />

        {/* Laser Scanning Line */}
        <div className="scan-line" />

        {/* Central Film Cell / Thumbnail */}
        {video.thumbnail ? (
          <div
            className="film-cell-thumb"
            style={{ backgroundImage: `url(${JSON.stringify(video.thumbnail)})` }}
          />
        ) : (
          <div className="film-cell-graphic">
            <Film size={44} strokeWidth={1.5} className="film-icon" />
            <div className="aperture-ring" />
          </div>
        )}

        {/* Telemetry HUD Badges */}
        <div className="hud-badge top-left">
          <span className="live-rec-dot" />
          <span>LIVE INGEST</span>
        </div>
        <div className="hud-badge top-right">
          <span>{video.source_type === 'youtube' ? 'YOUTUBE STREAM' : 'LOCAL MEDIA'}</span>
        </div>
        <div className="hud-badge bottom-left">
          <span>H.264 · 1080p</span>
        </div>
        <div className="hud-badge bottom-right">
          <span>BUFFER: 100%</span>
        </div>
      </div>

      {/* Filmstrip Sprocket Margin Bottom */}
      <div className="filmstrip-track bottom">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="sprocket-hole" />
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 02 — Audio Extraction
   Dynamic reactive waveform bars, illuminated extraction sweep, stereo VU meters
   ========================================================================== */
function AudioExtractionVisual({ video }: { video: Video }) {
  return (
    <div className="pipeline-visual visual-audio" aria-hidden="true">
      {/* Left Stereo VU Meter */}
      <div className="vu-meter left">
        <span className="vu-label">L</span>
        <div className="vu-bars">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} className={`vu-pip vu-pip-${i}`} />
          ))}
        </div>
      </div>

      {/* Central Multi-Frequency Waveform */}
      <div className="waveform-container">
        <div className="waveform-sweep-overlay" />
        <div className="waveform-bars">
          {Array.from({ length: 32 }, (_, i) => {
            const height = 18 + Math.sin(i * 0.45) * 22 + Math.cos(i * 0.8) * 14;
            return (
              <i
                key={i}
                className="wave-bar"
                style={{
                  '--i': i,
                  '--h': `${Math.max(12, height)}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      </div>

      {/* Right Stereo VU Meter */}
      <div className="vu-meter right">
        <span className="vu-label">R</span>
        <div className="vu-bars">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} className={`vu-pip vu-pip-${i}`} />
          ))}
        </div>
      </div>

      {/* Telemetry Readout */}
      <div className="visual-telemetry">
        <span>16,000 Hz MONO PCM</span>
        <span>•</span>
        <span>VOICE ISOLATION ACTIVE</span>
        {video.duration ? (
          <>
            <span>•</span>
            <span>{Math.round(video.duration)}s DURATION</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 03 — Transcription
   Progressive dialogue lines, active word highlight glow, timestamps, Whisper badge
   ========================================================================== */
function TranscriptionVisual({ video }: { video: Video }) {
  const language = video.language ? video.language.toUpperCase() : 'AUTO';

  return (
    <div className="pipeline-visual visual-transcript" aria-hidden="true">
      <div className="transcript-terminal">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="terminal-title">WHISPER ON-DEVICE SPEECH ENGINE ({language})</span>
          <span className="terminal-badge">LIVE TRANSCRIBING</span>
        </div>

        {/* Live Streaming Lines */}
        <div className="terminal-body">
          <div className="transcript-line settled">
            <span className="timestamp-pill">[00:04]</span>
            <p className="line-text">In this session, we investigate high-dimensional geometric representations.</p>
          </div>
          <div className="transcript-line settled">
            <span className="timestamp-pill">[00:12]</span>
            <p className="line-text">Dense vector embeddings allow semantic search across complex domains.</p>
          </div>
          <div className="transcript-line active">
            <span className="timestamp-pill active">[00:20]</span>
            <p className="line-text">
              <span className="word-glow">Every spoken phrase</span> is automatically aligned with exact timestamps
              <span className="typing-cursor">|</span>
            </p>
          </div>
        </div>

        {/* Real-time metrics footer */}
        <div className="terminal-footer">
          <span>MODEL: Whisper Small</span>
          <span>BEAM SEARCH: k=5</span>
          <span>CONFIDENCE: 98.4%</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 04 — Structure Generation
   Hierarchical timeline, branching SVG connector vectors, illuminated chapter cards
   ========================================================================== */
function StructureGenerationVisual() {
  return (
    <div className="pipeline-visual visual-structure" aria-hidden="true">
      <div className="structure-tree">
        {/* Central Timeline Spine */}
        <div className="spine-track">
          <div className="spine-pulse" />
        </div>

        {/* Branching Chapter Cards */}
        <div className="chapters-cluster">
          <div className="chapter-node node-1 done">
            <div className="node-marker">
              <Check size={11} strokeWidth={3} />
            </div>
            <div className="node-card">
              <span className="node-time">00:00 — 02:15</span>
              <strong>01 · Foundational Principles</strong>
              <p>Core problem definition and baseline concepts.</p>
            </div>
          </div>

          <div className="chapter-node node-2 active">
            <div className="node-marker active-pulse" />
            <div className="node-card active-card">
              <span className="node-time">02:15 — 05:40</span>
              <strong>02 · Architecture &amp; Methodology</strong>
              <p>Partitioning passages at conversational shifts.</p>
            </div>
          </div>

          <div className="chapter-node node-3 pending">
            <div className="node-marker" />
            <div className="node-card">
              <span className="node-time">05:40 — END</span>
              <strong>03 · Empirical Findings</strong>
              <p>Key synthesis and grounded takeaways.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="visual-telemetry">
        <span>BOUNDED PASSAGES: 45s WINDOW</span>
        <span>•</span>
        <span>SEMANTIC COHESION: 96%</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 05 — Embeddings
   Semantic vector space constellation, 3D coordinate axes, dynamic filament links
   ========================================================================== */
function EmbeddingsVisual() {
  return (
    <div className="pipeline-visual visual-embeddings" aria-hidden="true">
      <div className="constellation-box">
        {/* Orbital Axis Rings */}
        <div className="constellation-orbit orbit-1" />
        <div className="constellation-orbit orbit-2" />

        {/* Floating Vector Points */}
        <div className="vector-points">
          {Array.from({ length: 20 }, (_, i) => {
            const x = 15 + ((i * 19) % 70);
            const y = 15 + ((i * 29) % 70);
            return (
              <span
                key={i}
                className="vector-point"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  '--delay': `${(i * 0.25).toFixed(2)}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {/* Dynamic Filament Connections SVG */}
        <svg className="filaments-svg" viewBox="0 0 400 200">
          <line x1="60" y1="50" x2="140" y2="90" className="filament-line f-1" />
          <line x1="140" y1="90" x2="220" y2="70" className="filament-line f-2" />
          <line x1="220" y1="70" x2="300" y2="120" className="filament-line f-3" />
          <line x1="140" y1="90" x2="190" y2="150" className="filament-line f-4" />
          <line x1="190" y1="150" x2="280" y2="160" className="filament-line f-5" />
          <line x1="220" y1="70" x2="340" y2="60" className="filament-line f-6" />
        </svg>

        {/* Vector HUD Readout */}
        <div className="vector-hud">
          <span className="coord-chip">[0.312, -0.745, +0.108, … 384-dim]</span>
          <span className="metric-chip">COSINE SIMILARITY: 0.92</span>
        </div>
      </div>

      <div className="visual-telemetry">
        <span>TRANSFORMER: all-MiniLM-L6-v2</span>
        <span>•</span>
        <span>LOCAL VECTOR STORE: CHROMA</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 06 — Topics Clustering
   K-Means topic centroid clusters, breathing hulls, Delaunay meshes, PCA grid
   ========================================================================== */
function TopicsClusteringVisual() {
  return (
    <div className="pipeline-visual visual-topics" aria-hidden="true">
      <div className="topics-cluster-grid">
        {/* PCA Axis Reference */}
        <div className="pca-cross-h" />
        <div className="pca-cross-v" />

        {/* Cluster 01: Indigo */}
        <div className="cluster-group cluster-1">
          <div className="cluster-halo halo-1" />
          <div className="cluster-centroid centroid-1">
            <span className="centroid-dot" />
            <span className="centroid-label">Topic 1 · Semantic Retrieval</span>
          </div>
          <span className="satellite-dot s1" />
          <span className="satellite-dot s2" />
          <span className="satellite-dot s3" />
        </div>

        {/* Cluster 02: Violet */}
        <div className="cluster-group cluster-2">
          <div className="cluster-halo halo-2" />
          <div className="cluster-centroid centroid-2">
            <span className="centroid-dot" />
            <span className="centroid-label">Topic 2 · Representation Learning</span>
          </div>
          <span className="satellite-dot s4" />
          <span className="satellite-dot s5" />
          <span className="satellite-dot s6" />
        </div>

        {/* Cluster 03: Amber */}
        <div className="cluster-group cluster-3">
          <div className="cluster-halo halo-3" />
          <div className="cluster-centroid centroid-3">
            <span className="centroid-dot" />
            <span className="centroid-label">Topic 3 · Vector Indexing</span>
          </div>
          <span className="satellite-dot s7" />
          <span className="satellite-dot s8" />
        </div>
      </div>

      <div className="visual-telemetry">
        <span>K-MEANS CLUSTERING (k=3)</span>
        <span>•</span>
        <span>PCA 2D PROJECTION: 70.5% VARIANCE</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE 07 — Analysis Synthesis
   Assembling Executive Dossier, layered report cards, radial completion aura
   ========================================================================== */
function AnalysisSynthesisVisual() {
  return (
    <div className="pipeline-visual visual-analysis" aria-hidden="true">
      <div className="dossier-deck">
        {/* Background Card Deck Stack */}
        <div className="dossier-card card-back" />
        <div className="dossier-card card-mid" />

        {/* Front Assembled Report */}
        <div className="dossier-card card-front">
          <div className="dossier-header">
            <div className="dossier-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <strong>EXECUTIVE INTELLIGENCE DOSSIER</strong>
              <span>SYNTHESIZING COMPLETE MULTIMODAL REPORT</span>
            </div>
          </div>

          <div className="dossier-items">
            <div className="dossier-row done">
              <CheckCircle2 size={14} color="var(--success)" />
              <span>Hierarchical Summary &amp; Overview</span>
            </div>
            <div className="dossier-row done">
              <CheckCircle2 size={14} color="var(--success)" />
              <span>Interactive Chapter Timelines &amp; Seeks</span>
            </div>
            <div className="dossier-row done">
              <CheckCircle2 size={14} color="var(--success)" />
              <span>Timestamped Grounded Q&amp;A Citations</span>
            </div>
          </div>
        </div>

        {/* Radial Radiance Wave */}
        <div className="completion-radiance" />
      </div>

      <div className="visual-telemetry">
        <span>SYNTHESIS READY</span>
        <span>•</span>
        <span>ALL 7 PIPELINE STAGES SYNCHRONIZED</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAGE PAUSED / FAILED Visual
   ========================================================================== */
function InterruptedVisual() {
  return (
    <div className="pipeline-visual visual-interrupted" aria-hidden="true">
      <div className="interrupted-box">
        <div className="interrupted-icon-wrap">
          <AlertTriangle size={36} color="var(--danger)" />
        </div>
        <strong>PROCESSING CHECKPOINT PRESERVED</strong>
        <p>Completed stages are saved on disk. You can safely resume without losing progress.</p>
        <div className="checkpoint-chips">
          <span className="chip done">
            <Check size={12} /> Audio Extracted
          </span>
          <span className="chip done">
            <Check size={12} /> Transcripts Saved
          </span>
          <span className="chip pending">Embeddings Resume</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN PROCESSING COMPONENT
   ========================================================================== */
export default function Processing({ video, onRefresh }: { video: Video; onRefresh: () => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const failed = video.status === 'failed';
  const ready = video.status === 'ready';
  const active = stages.findIndex((s) => s.match.test(video.stage));
  const safeActive = active >= 0 ? active : ready ? 6 : 0;

  async function retry() {
    setBusy(true);
    try {
      await api(`/videos/${video.id}/retry`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Render the dedicated cinematic animation for whichever stage is active
  function renderStageVisual() {
    if (failed) return <InterruptedVisual />;
    if (ready) return <AnalysisSynthesisVisual />;

    switch (safeActive) {
      case 0:
        return <VideoAcquisitionVisual video={video} />;
      case 1:
        return <AudioExtractionVisual video={video} />;
      case 2:
        return <TranscriptionVisual video={video} />;
      case 3:
        return <StructureGenerationVisual />;
      case 4:
        return <EmbeddingsVisual />;
      case 5:
        return <TopicsClusteringVisual />;
      case 6:
      default:
        return <AnalysisSynthesisVisual />;
    }
  }

  return (
    <section className={`processing-page ${failed ? 'is-failed' : ''}`} aria-label="Video processing">
      {/* Top Section */}
      <div className="eyebrow">
        {failed ? (
          <>
            <AlertTriangle size={14} color="var(--danger)" />
            YOUR PROGRESS IS SAVED
          </>
        ) : ready ? (
          <>
            <Check size={14} color="var(--success)" />
            ANALYSIS COMPLETE
          </>
        ) : (
          <>
            <Sparkles size={14} />
            INTELLIGENCE PIPELINE ACTIVE
          </>
        )}
      </div>

      <h1>
        {failed
          ? 'Processing Paused'
          : ready
          ? 'Your Video is Understood'
          : 'Making Sense of Every Moment.'}
      </h1>

      <p className="processing-title">{video.title}</p>

      {/* Central Dedicated Animation Stage */}
      <div
        className={`stage-art stage-${safeActive} ${failed ? 'paused is-failed' : ready ? 'is-ready' : 'is-running'}`}
        aria-hidden="true"
      >
        {renderStageVisual()}
      </div>

      {/* Stage Caption and Status Readout */}
      <div className="stage-caption" role="status" aria-live="polite">
        <span className="eyebrow-badge" style={{ marginBottom: '14px' }}>
          {ready ? 'COMPLETE' : failed ? 'PAUSED' : video.stage || 'Preparing Engine'}
        </span>
        <h2>
          {failed
            ? 'We paused before finishing the analysis.'
            : ready
            ? 'Everything is indexed and ready to explore.'
            : safeActive >= 0
            ? stages[safeActive].description
            : 'Your media is being prepared on-device.'}
        </h2>
        <p>
          {failed
            ? 'All completed transcription and embeddings are preserved on disk. Resume anytime.'
            : 'You can navigate away anytime. Processing continues in the background automatically.'}
        </p>
      </div>

      {/* Horizontal 7-Stage Progress Stepper */}
      {!failed && (
        <ol className="stage-track">
          {stages.map((s, i) => {
            const isDone = ready || (safeActive > -1 && i < safeActive);
            const isCurrent = !ready && i === safeActive;
            return (
              <li
                key={s.name}
                aria-current={isCurrent ? 'step' : undefined}
                className={isDone ? 'done' : isCurrent ? 'current' : ''}
              >
                <span>{ready ? <Check size={14} /> : String(i + 1).padStart(2, '0')}</span>
                {s.name}
              </li>
            );
          })}
        </ol>
      )}

      {/* Failed State Action Bar */}
      {failed && (
        <div className="processing-actions">
          <button className="button primary" disabled={busy} onClick={retry}>
            <RotateCcw size={16} className={busy ? 'spin' : ''} />
            {busy ? 'Resuming…' : 'Retry'}
          </button>
          <Link className="button secondary" href="/library">
            Back to library
          </Link>
        </div>
      )}

      {/* Technical Diagnostics */}
      {video.error && (
        <details className="technical-details">
          <summary>Failure details</summary>
          <p>{video.error}</p>
        </details>
      )}

      {error && <ErrorNotice detail={error} />}

      {/* Quick Jump to Saved Partial Transcript */}
      {video.transcript?.length ? (
        <div style={{ marginTop: '24px' }}>
          <Link className="button secondary" href={`/video/${video.id}/transcript`}>
            <FileText size={16} />
            Explore Saved Transcript ({video.transcript.length} segments)
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : null}

      {/* Real-time Persistence Facts */}
      <div className="processing-facts">
        {!!video.transcript?.length && (
          <span>
            <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            {video.transcript.length} speech segments transcribed
          </span>
        )}
        {!!video.chunks?.length && (
          <span>
            <Boxes size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            {video.chunks.length} passages structured
          </span>
        )}
        {!!video.embedded && (
          <span>
            <Database size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Chroma vector index stored
          </span>
        )}
      </div>

      {ready && (
        <div style={{ marginTop: '30px' }}>
          <Link className="button primary" href={`/video/${video.id}`} style={{ padding: '14px 28px', fontSize: '15px' }}>
            Open Video Workspace
            <ArrowUpRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}
