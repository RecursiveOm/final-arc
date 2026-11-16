'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Clock3,
  History,
  ScanLine,
  ChevronRight,
  Sparkles,
  User
} from 'lucide-react';
import { api, type Video, type Message, time, parseTime } from '@/lib/api';
import { Player, type PlayerHandle } from './player';
import { ArcMark, Drawer, ErrorNotice } from './app-shell';

function SourcePlayer({ video, at }: { video: Video; at: number }) {
  const player = useRef<PlayerHandle>(null);
  useEffect(() => {
    player.current?.seek(at);
  }, [at]);

  return (
    <>
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--line)' }}>
        <Player video={video} ref={player} />
      </div>
      <div className="source-caption">
        <span className="timestamp">{time(at)}</span>
        <p>{video.title}</p>
      </div>
    </>
  );
}

export default function Chat({ video }: { video: Video }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [validation, setValidation] = useState('');
  const [history, setHistory] = useState(false);
  const [source, setSource] = useState<number | null>(null);
  const [range, setRange] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reload, setReload] = useState(0);

  const list = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const nearBottom = useRef(true);
  const lastRequest = useRef<{ question: string; start: number | null; end: number | null } | null>(null);

  useEffect(() => {
    let active = true;
    api<Message[]>(`/videos/${video.id}/chat`)
      .then((m) => {
        if (active) {
          setMessages(m);
          setLoadError('');
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (active) {
          setLoadError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [video.id, reload]);

  useEffect(() => {
    if (nearBottom.current) {
      const el = list.current;
      el?.scrollTo({
        top: el.scrollHeight,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  }, [messages, busy, loading]);

  async function send(value = question, retry = false) {
    if (busy || loading || loadError || !video.embedded || !value.trim()) return;
    const a = range ? parseTime(start) : null;
    const b = range ? parseTime(end) : null;

    if (!retry && range && (a === null || b === null || a >= b || (video.duration !== null && b > video.duration))) {
      setValidation('Enter a valid range within this video, such as 00:30 → 01:00.');
      return;
    }

    const request = retry && lastRequest.current ? lastRequest.current : { question: value.trim(), start: a, end: b };
    lastRequest.current = request;
    setBusy(true);
    setError('');
    setValidation('');
    nearBottom.current = true;

    try {
      const reply = await api<Message>(`/videos/${video.id}/chat`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      setMessages((m) => [...m, { role: 'user', content: request.question, citations: [] }, reply]);
      setQuestion('');
    } catch (e) {
      setError((e as Error).message);
      setQuestion(request.question);
    } finally {
      setBusy(false);
      composer.current?.focus();
    }
  }

  return (
    <div className="chat-page">
      {/* Chat Navigation Header */}
      <header className="chat-topbar">
        <Link aria-label="Back to video workspace" className="back-link" href={`/video/${video.id}`}>
          <ArrowLeft size={16} />
          <span>Back to Video</span>
        </Link>

        <div className="chat-context">
          <span
            className="context-thumbnail"
            style={video.thumbnail ? { backgroundImage: `url(${JSON.stringify(video.thumbnail)})` } : undefined}
          >
            <span aria-hidden="true">▶</span>
          </span>
          <div>
            <strong>{video.title}</strong>
            <span>
              {time(video.duration || 0)} • {video.status === 'ready' ? 'Grounded Retrieval Ready' : 'Indexing Context'}
            </span>
          </div>
        </div>

        <button aria-label="History" className="button ghost" onClick={() => setHistory(true)}>
          <History size={16} />
          <span>History</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div
        className="chat-messages"
        ref={list}
        onScroll={() => {
          const el = list.current;
          if (el) nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        }}
      >
        <div className="conversation">
          {loading ? (
            <div className="empty-state" role="status">
              <div className="thinking-dots">
                <i />
                <i />
                <i />
              </div>
              <p>Opening your conversation history…</p>
            </div>
          ) : loadError ? (
            <ErrorNotice
              title="Your conversation could not be loaded."
              detail={loadError}
              retry={() => {
                setLoading(true);
                setReload((n) => n + 1);
              }}
            />
          ) : !messages.length ? (
            <div className="chat-empty">
              <div className="chat-emblem">
                <ArcMark size={32} />
              </div>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                <Sparkles size={14} />
                A CONVERSATION WITH YOUR VIDEO
              </div>
              <h1>Follow your curiosity.</h1>
              <p>
                Find a detail. Untangle an idea.
                <br />
                Every answer leads back to a moment.
              </p>
              <div className="suggestions">
                {['What is the core message of this video?', 'Summarize the main arguments and takeaways.', 'Explain the key concept in simple terms.'].map(
                  (q) => (
                    <button key={q} disabled={!video.embedded || busy} onClick={() => void send(q)}>
                      <span>{q}</span>
                      <ArrowUpRight size={16} color="var(--accent)" />
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <article id={`message-${i}`} key={i} className={`message ${m.role}`}>
                <div className="message-label">
                  {m.role === 'user' ? (
                    <span className="user-mark">
                      <User size={13} />
                    </span>
                  ) : (
                    <ArcMark size={20} />
                  )}
                  <span>{m.role === 'user' ? 'YOU' : 'ARC INTELLIGENCE'}</span>
                </div>
                <div className="message-body">
                  <p>{m.content}</p>
                  {m.citations?.length > 0 && (
                    <div className="citations">
                      {m.citations.map((c, j) => (
                        <button
                          key={j}
                          className="timestamp"
                          title={`Jump to source moment: ${c.text}`}
                          onClick={() => setSource(c.start)}
                        >
                          <Clock3 size={12} />
                          {time(c.start)}
                          <ArrowUpRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}

          {busy && (
            <div className="thinking" role="status">
              <div className="thinking-dots">
                <i />
                <i />
                <i />
              </div>
              <span>Searching semantic passages and synthesizing answer…</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Prompt Composer */}
      <div className="composer-wrap">
        <div className="chat-composer">
          {error && (
            <ErrorNotice
              title="Unable to reach the analysis model."
              detail={error}
              retry={() => void send(lastRequest.current?.question || question, true)}
            />
          )}

          {validation && (
            <p className="inline-error" role="alert">
              {validation}
            </p>
          )}

          {/* Time-Range Focus Control */}
          <button
            className={`range-toggle ${range ? 'active' : ''}`}
            aria-expanded={range}
            disabled={busy}
            onClick={() => setRange(!range)}
          >
            <ScanLine size={14} />
            <span>{range ? 'Focus on a section' : 'Ask about a specific section'}</span>
            <span style={{ fontWeight: 700 }}>{range ? '−' : '+'}</span>
          </button>

          {range && (
            <div className="range-inputs">
              <label>
                From
                <input
                  aria-label="Range start"
                  placeholder="00:00"
                  value={start}
                  disabled={busy}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <span className="muted">→</span>
              <label>
                To
                <input
                  aria-label="Range end"
                  placeholder={time(video.duration || 0)}
                  value={end}
                  disabled={busy}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => setQuestion('Explain only this selected section.')}
              >
                Explain this range
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={composer}
              aria-label="Ask ARC"
              placeholder={video.embedded ? 'Ask a question about this video… (Press Enter to send)' : 'Waiting for vector index…'}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!video.embedded || loading || !!loadError || busy}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              className="send-button"
              aria-label="Send question"
              disabled={!video.embedded || busy || loading || !!loadError || !question.trim()}
            >
              <ArrowUp size={18} />
            </button>
          </form>

          <p className="chat-disclaimer">
            Grounded intelligence: all answers reference actual timestamped video transcripts.
          </p>
        </div>
      </div>

      {/* History Slide-over Drawer */}
      {history && (
        <Drawer title="Conversation history" onClose={() => setHistory(false)}>
          <p className="drawer-description">Your saved conversation with this video.</p>
          {messages.some((m) => m.role === 'user') ? (
            <div className="history-list">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <button
                    key={i}
                    onClick={() => {
                      setHistory(false);
                      nearBottom.current = false;
                      requestAnimationFrame(() =>
                        document
                          .getElementById(`message-${i}`)
                          ?.scrollIntoView({
                            block: 'center',
                            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                          })
                      );
                    }}
                  >
                    <span>{m.content}</span>
                    <ArrowUpRight size={16} color="var(--accent)" />
                  </button>
                ) : null
              )}
            </div>
          ) : (
            <div className="empty-state">
              <History size={28} />
              <h3>No questions asked yet</h3>
              <p>Questions and answers will be saved in this session.</p>
            </div>
          )}
        </Drawer>
      )}

      {/* Source Moment Slide-over Drawer with Integrated Player */}
      {source !== null && (
        <Drawer title="Source moment" className="source-drawer" onClose={() => setSource(null)}>
          <SourcePlayer video={video} at={source} />
          <p className="drawer-description">A moment of context, without losing your conversation.</p>
          <Link className="button secondary" href={`/video/${video.id}`} style={{ width: '100%', justifyContent: 'center' }}>
            Open full analysis
            <ArrowUpRight size={16} />
          </Link>
        </Drawer>
      )}
    </div>
  );
}
