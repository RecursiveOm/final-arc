'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { api, type Video } from '@/lib/api';
import Workspace from './workspace';
import Chat from './chat';
import Processing from './processing';
import { ErrorNotice } from './app-shell';

export default function VideoScreen({ id, section }: { id: string; section: string }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setVideo(await api<Video>(`/videos/${id}`));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let previous = '';

    async function load() {
      try {
        const status = await api<Video>(`/videos/${id}/status`);
        if (!active) return;
        const fingerprint = `${status.status}:${status.embedded}:${status.has_transcript}`;
        if (fingerprint !== previous) {
          const full = await api<Video>(`/videos/${id}`);
          if (!active) return;
          setVideo(full);
          previous = fingerprint;
        } else {
          setVideo((v) => (v ? { ...v, ...status } : v));
        }
        setError('');
        if (['queued', 'processing'].includes(status.status)) {
          timer = setTimeout(load, 3000);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, video?.status]);

  if (!video) {
    return (
      <div className="page" style={{ maxWidth: '800px', textAlign: 'center', paddingTop: '80px' }}>
        {error ? (
          <>
            <ErrorNotice title="We could not open this video analysis." detail={error} retry={() => void refresh()} />
            <Link className="button secondary" href="/library">
              <ArrowLeft size={16} />
              Return to Library
            </Link>
          </>
        ) : (
          <div className="page-loading" role="status">
            <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-xl)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: 'var(--muted)' }}>
              <Loader2 size={16} className="spin" color="var(--accent)" />
              <p style={{ fontWeight: 500 }}>Connecting to local storage and loading analysis…</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (video.status !== 'ready' && (!section || section === 'summary')) {
    return <Processing video={video} onRefresh={() => void refresh()} />;
  }

  return (
    <>
      {error && <ErrorNotice detail={error} retry={() => void refresh()} />}
      {section === 'chat' ? (
        <Chat key={id} video={video} />
      ) : (
        <Workspace video={video} section={section} onRefresh={() => void refresh()} />
      )}
    </>
  );
}
