// liveEventStream.js
//
// Simulates a real-time event feed the way a WebSocket connection to a
// live-streaming backend would. In production this file would be replaced
// by a thin wrapper around `new WebSocket(url)` — everything downstream
// (ChatFeed, ReactionLayer, ViewerCounter) only depends on the event shape
// below, so swapping the transport later is a one-file change.

const USERNAMES = [
  "mira.codes", "noah_builds", "tasha.k", "devon_ux", "ling_wei",
  "jaydenlive", "priya.codes", "sam_frontend", "yui.dev", "carlos_m",
  "aisha_r", "ben.stack", "keiko_v", "omar_dev", "lucy.codes",
];

const CHAT_LINES = [
  "does this come in blue?",
  "just ordered mine!!",
  "how's the sizing on this",
  "wait that's such a good price",
  "can you show the back",
  "omg need this",
  "is shipping free",
  "how long is the sale",
  "adding to cart now",
  "does it run small",
  "love the colorway",
  "restocking soon?",
];

const REACTIONS = ["heart", "fire", "clap", "star"];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `evt_${idCounter}_${Date.now()}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Starts emitting simulated live events at a given rate.
 *
 * @param {(event: object) => void} onEvent - called for every new event
 * @param {{ messagesPerSecond?: number }} options
 * @returns {() => void} stop function
 */
export function startLiveEventStream(onEvent, options = {}) {
  const { messagesPerSecond = 3 } = options;
  const intervalMs = 1000 / messagesPerSecond;

  let viewerCount = 1240;

  const interval = setInterval(() => {
    const roll = Math.random();

    if (roll < 0.7) {
      onEvent({
        type: "chat",
        id: nextId(),
        user: randomFrom(USERNAMES),
        text: randomFrom(CHAT_LINES),
        ts: Date.now(),
      });
    } else if (roll < 0.9) {
      onEvent({
        type: "reaction",
        id: nextId(),
        user: randomFrom(USERNAMES),
        reaction: randomFrom(REACTIONS),
        ts: Date.now(),
      });
    } else {
      onEvent({
        type: "purchase",
        id: nextId(),
        user: randomFrom(USERNAMES),
        product: "Cloud Knit Sweater",
        ts: Date.now(),
      });
    }

    // viewer count drifts up/down slightly to feel alive
    viewerCount += Math.floor(Math.random() * 7) - 3;
    onEvent({ type: "viewerCount", id: nextId(), count: viewerCount, ts: Date.now() });
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Fires a burst of chat messages instantly — used to demonstrate/benchmark
 * how the chat feed holds up under a sudden spike (e.g. right after a
 * product drop), which is the real performance story of this project.
 */
export function burstMessages(onEvent, count = 500) {
  for (let i = 0; i < count; i += 1) {
    onEvent({
      type: "chat",
      id: nextId(),
      user: randomFrom(USERNAMES),
      text: randomFrom(CHAT_LINES),
      ts: Date.now(),
    });
  }
}
