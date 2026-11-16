'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Film, AlertCircle } from 'lucide-react';
import { Video } from '@/lib/api';

type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
};

type YTApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width: string;
      height: string;
      playerVars: Record<string, number | string>;
      events: { onReady: () => void; onError: () => void };
    }
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ready: Promise<void> | undefined;

function youtubeReady() {
  if (window.YT?.Player) return Promise.resolve();
  if (!ready)
    ready = new Promise<void>((resolve, reject) => {
      window.onYouTubeIframeAPIReady = resolve;
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        ready = undefined;
        reject(new Error('YouTube player API could not load.'));
      };
      document.head.appendChild(script);
    });
  return ready;
}

export type PlayerHandle = { seek: (seconds: number) => void };

export const Player = forwardRef<PlayerHandle, { video: Video }>(function Player({ video }, ref) {
  const native = useRef<HTMLVideoElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const loaded = useRef(false);
  const pending = useRef<number | null>(null);
  const [error, setError] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      seek(seconds) {
        if (video.source_type === 'youtube') {
          if (loaded.current && yt.current) {
            yt.current.seekTo(seconds, true);
            yt.current.playVideo();
          } else {
            pending.current = seconds;
          }
        } else if (native.current) {
          if (native.current.readyState < 1) {
            pending.current = seconds;
          } else {
            native.current.currentTime = seconds;
            void native.current.play().catch(() => {});
          }
        }
      },
    }),
    [video.source_type]
  );

  useEffect(() => {
    if (!video.youtube_id) return;
    let cancelled = false;

    void youtubeReady()
      .then(() => {
        if (cancelled || !host.current || !window.YT) return;
        const target = document.createElement('div');
        host.current.replaceChildren(target);
        yt.current = new window.YT.Player(target, {
          videoId: video.youtube_id!,
          width: '100%',
          height: '100%',
          playerVars: { origin: window.location.origin, playsinline: 1, rel: 0 },
          events: {
            onReady: () => {
              loaded.current = true;
              if (pending.current !== null) {
                yt.current?.seekTo(pending.current, true);
                yt.current?.playVideo();
                pending.current = null;
              }
            },
            onError: () =>
              setError('YouTube playback is restricted for this video. You can still explore all saved transcripts & analysis.'),
          },
        });
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
      loaded.current = false;
      yt.current?.destroy();
      yt.current = null;
    };
  }, [video.youtube_id]);

  return (
    <div className="player-wrap">
      {video.source_type === 'youtube' ? (
        <div ref={host} className="youtube-player" />
      ) : video.has_media ? (
        <video
          ref={native}
          onLoadedMetadata={() => {
            if (pending.current !== null && native.current) {
              native.current.currentTime = pending.current;
              pending.current = null;
              void native.current.play().catch(() => {});
            }
          }}
          controls
          playsInline
          preload="metadata"
          src={`/api/videos/${video.id}/media`}
          onError={() => setError('Playback stream is being prepared on disk. Refresh in a moment.')}
        />
      ) : (
        <div className="player-placeholder">
          <Film size={32} style={{ marginBottom: '8px', opacity: 0.7 }} />
          <div>Playback stream will be available here after ingestion finishes.</div>
        </div>
      )}
      {error && (
        <div className="player-error" role="status">
          <AlertCircle size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
          {error}
        </div>
      )}
    </div>
  );
});
