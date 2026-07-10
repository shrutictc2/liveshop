import { useEffect, useRef, useState } from "react";
import "./ReactionLayer.css";

const EMOJI = { heart: "❤️", fire: "🔥", clap: "👏", star: "⭐" };

// Reactions arrive several times a second in a busy stream. Animating every
// single one would spawn dozens of DOM nodes per second and tank frame
// rate, so we throttle how many float across the screen and let excess
// reactions simply not render a bubble (they're still counted elsewhere).
const MAX_CONCURRENT_BUBBLES = 8;

export default function ReactionLayer({ latestReaction }) {
  const [bubbles, setBubbles] = useState([]);
  const seenId = useRef(null);

  useEffect(() => {
    if (!latestReaction || latestReaction.id === seenId.current) return;
    seenId.current = latestReaction.id;

    setBubbles((prev) => {
      if (prev.length >= MAX_CONCURRENT_BUBBLES) return prev;
      const bubble = {
        id: latestReaction.id,
        emoji: EMOJI[latestReaction.reaction] || "❤️",
        left: 10 + Math.random() * 80,
      };
      return [...prev, bubble];
    });

    const timeout = setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== latestReaction.id));
    }, 1800);

    return () => clearTimeout(timeout);
  }, [latestReaction]);

  return (
    <div className="reaction-layer" aria-hidden="true">
      {bubbles.map((b) => (
        <span key={b.id} className="reaction-bubble" style={{ left: `${b.left}%` }}>
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
