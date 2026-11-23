'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

const AVATAR_ID = '168197f4-79bf-4394-a5f3-80dfea9a2e9b';

interface AvatarMeta {
  name?: string;
  imageUrl?: string;
}

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

interface MapEntry {
  query: string;
  timestamp: number;
}

export default function Home() {
  const [meta, setMeta] = useState<AvatarMeta>({});
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [mapHistory, setMapHistory] = useState<MapEntry[]>([]);

  // Fetch avatar metadata on load
  useEffect(() => {
    fetch(`/api/avatar/${AVATAR_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setMeta({ name: data.name, imageUrl: data.imageUrl });
        }
      })
      .catch(console.error);
  }, []);

  // Handle the open_google_maps client event from the avatar
  const handleClientEvent = useCallback((event: { type: 'client_event'; tool: string; args: Record<string, unknown> }) => {
    if (event.tool === 'open_google_maps') {
      const query = event.args.query as string;
      if (query) {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        window.open(url, '_blank');
        setMapHistory((prev) => [{ query, timestamp: Date.now() }, ...prev]);
      }
    }
  }, []);

  async function startCall() {
    setIsCreating(true);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: AVATAR_ID }),
      });
      const data = await res.json();
      setSession(data);
      setIsCallActive(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  }

  function endCall() {
    setIsCallActive(false);
    setSession(null);
  }

  return (
    <main className="page">
      {/* Landing content */}
      <div className="landing">
        <h1 className="title">Rusty's Food Guide</h1>
        <p className="subtitle">
          Your adorable red panda foodie — ask for recommendations and I'll open them on Google Maps!
        </p>

        {mapHistory.length > 0 && (
          <div className="history">
            <h3 className="history-title">Recently Recommended</h3>
            <ul className="history-list">
              {mapHistory.map((entry) => (
                <li key={entry.timestamp} className="history-item">
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(entry.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.query}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Floating panda avatar */}
      <div className={`float-container ${isCallActive ? 'float-active' : ''}`}>
        {isCallActive && session ? (
          <div className="float-call">
            <button className="float-close" onClick={endCall} aria-label="End call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
            <Suspense fallback={<div className="float-loading">Connecting...</div>}>
              <AvatarCall
                avatarId={AVATAR_ID}
                sessionId={session.sessionId}
                sessionKey={session.sessionKey}
                avatarImageUrl={meta.imageUrl}
                onEnd={endCall}
                onError={console.error}
                onClientEvent={handleClientEvent}
              />
            </Suspense>
          </div>
        ) : (
          <button className="float-button" onClick={startCall} disabled={isCreating}>
            {meta.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={meta.imageUrl} alt="Rusty" className="float-avatar-img" />
            ) : (
              <div className="float-avatar-placeholder" />
            )}
            <div className="float-label">
              {isCreating ? 'Starting...' : 'Ask Rusty!'}
            </div>
          </button>
        )}
      </div>
    </main>
  );
}
