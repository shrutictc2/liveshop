import { useCallback, useEffect, useRef, useState } from "react";
import ChatFeed from "./components/ChatFeed";
import ProductCarousel from "./components/ProductCarousel";
import ReactionLayer from "./components/ReactionLayer";
import { startLiveEventStream, burstMessages } from "./lib/liveEventStream";
import "./App.css";

const MAX_CHAT_HISTORY = 5000;

export default function App() {
  const [chatEvents, setChatEvents] = useState([]);
  const [viewerCount, setViewerCount] = useState(1240);
  const [latestReaction, setLatestReaction] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fps, setFps] = useState(60);

  const frameTimes = useRef([]);

  const handleEvent = useCallback((event) => {
    if (event.type === "viewerCount") {
      setViewerCount(event.count);
      return;
    }
    if (event.type === "reaction") {
      setLatestReaction(event);
    }
    setChatEvents((prev) => {
      const next = [...prev, event];
      // Cap history so a long-running stream doesn't grow memory unbounded —
      // this mirrors how a real client would page out old messages.
      if (next.length > MAX_CHAT_HISTORY) {
        return next.slice(next.length - MAX_CHAT_HISTORY);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const stop = startLiveEventStream(handleEvent, { messagesPerSecond: 3 });
    return stop;
  }, [handleEvent]);

  // Simple rolling FPS readout so the "Simulate spike" stress test has a
  // visible, honest number instead of an unverifiable claim in the README.
  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const delta = now - last;
      last = now;
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 30) frameTimes.current.shift();
      const avg = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      setFps(Math.round(1000 / avg));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSpike = () => {
    burstMessages(handleEvent, 500);
  };

  return (
    <div className="app">
      <div className="app__stream-column">
        <div className="stream-frame">
          <div className="stream-frame__video">
            <div className="live-badge">
              <span className="live-badge__dot" />
              LIVE
            </div>
            <div className="viewer-count">
              <span className="viewer-count__value">{viewerCount.toLocaleString()}</span> watching
            </div>
            <ReactionLayer latestReaction={latestReaction} />
            {selectedProduct && (
              <div className="selected-product-toast">
                Featuring <strong>{selectedProduct.name}</strong> — ${selectedProduct.price}
              </div>
            )}
          </div>

          <ProductCarousel onSelect={setSelectedProduct} />
        </div>

        <div className="perf-panel">
          <div className="perf-panel__stat">
            <span className="perf-panel__label">FPS</span>
            <span className={`perf-panel__value ${fps < 45 ? "perf-panel__value--warn" : ""}`}>
              {fps}
            </span>
          </div>
          <div className="perf-panel__stat">
            <span className="perf-panel__label">Messages rendered</span>
            <span className="perf-panel__value">{chatEvents.length}</span>
          </div>
          <button className="perf-panel__button" onClick={handleSpike}>
            Simulate spike (+500 msgs)
          </button>
        </div>
      </div>

      <div className="app__chat-column">
        <ChatFeed events={chatEvents} />
      </div>
    </div>
  );
}
