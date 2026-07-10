import { useEffect } from "react";
import { List, useListRef } from "react-window";
import "./ChatFeed.css";

const REACTION_EMOJI = { heart: "❤️", fire: "🔥", clap: "👏", star: "⭐" };

function Row({ index, style, events }) {
  const event = events[index];

  if (event.type === "purchase") {
    return (
      <div style={style} className="chat-row chat-row--purchase">
        <span className="chat-row__user">{event.user}</span>
        <span> just bought </span>
        <span className="chat-row__product">{event.product}</span>
      </div>
    );
  }

  if (event.type === "reaction") {
    return (
      <div style={style} className="chat-row chat-row--reaction">
        <span className="chat-row__user">{event.user}</span>
        <span> reacted {REACTION_EMOJI[event.reaction]}</span>
      </div>
    );
  }

  return (
    <div style={style} className="chat-row">
      <span className="chat-row__user">{event.user}</span>
      <span className="chat-row__text">{event.text}</span>
    </div>
  );
}

/**
 * Renders a live chat feed backed by react-window.
 *
 * Why virtualization matters here: a naive `events.map(...)` render works
 * fine at 50 messages, but by a few hundred messages every incoming event
 * triggers a full re-render of every DOM node in the list, and the browser
 * has to lay out and paint nodes that aren't even visible. react-window
 * only mounts the rows inside the visible viewport (~12-15 rows) regardless
 * of whether the feed holds 50 or 50,000 messages, which is what keeps
 * scroll and incoming-message updates smooth under a spike (see the
 * "Simulate spike" button — that's a deliberate stress test).
 */
export default function ChatFeed({ events }) {
  const listRef = useListRef(null);

  useEffect(() => {
    if (listRef.current && events.length > 0) {
      listRef.current.scrollToRow({ index: events.length - 1, align: "end" });
    }
  }, [events.length, listRef]);

  return (
    <div className="chat-feed">
      <div className="chat-feed__header">Live chat · {events.length} messages</div>
      <List
        listRef={listRef}
        className="chat-feed__list"
        style={{ height: 360, width: "100%" }}
        rowCount={events.length}
        rowHeight={34}
        rowProps={{ events }}
        rowComponent={Row}
      />
    </div>
  );
}
