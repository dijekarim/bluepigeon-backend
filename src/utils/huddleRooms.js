const CONTEXT_PREFIX = "ctx";
const HUDDLE_PREFIX = "huddle";

function contextRoom(contextType, contextId) {
  if (!contextType || !contextId) return null;
  return `${CONTEXT_PREFIX}:${contextType}:${contextId}`;
}

function huddleRoom(sessionId) {
  if (!sessionId) return null;
  return `${HUDDLE_PREFIX}:${sessionId}`;
}

module.exports = {
  contextRoom,
  huddleRoom,
};

