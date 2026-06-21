/**
 * Socket.IO Event Handlers for Nexus
 *
 * CommonJS module loaded by server.js.
 * Handles real-time meeting communication, transcript streaming,
 * AI pipeline orchestration, and knowledge graph updates.
 */

const jwt = require('jsonwebtoken');
const admin = require('./firebase-admin.js');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dev-secret';

// ─── Room state tracking ────────────────────────────────────────────────────
/** @type {Map<string, Map<string, { userId: string, name: string, joinedAt: Date }>>} */
const meetingRooms = new Map();

/**
 * Get or create a room's participant map.
 * @param {string} meetingId
 * @returns {Map<string, { userId: string, name: string, joinedAt: Date }>}
 */
function getRoom(meetingId) {
  if (!meetingRooms.has(meetingId)) {
    meetingRooms.set(meetingId, new Map());
  }
  return meetingRooms.get(meetingId);
}

/**
 * Remove a socket from all rooms it's in.
 * @param {string} socketId
 * @param {import('socket.io').Server} io
 */
function removeFromAllRooms(socketId, io) {
  for (const [meetingId, participants] of meetingRooms.entries()) {
    if (participants.has(socketId)) {
      const user = participants.get(socketId);
      participants.delete(socketId);

      io.to(`meeting:${meetingId}`).emit('meeting:participant-left', {
        userId: user.userId,
        name: user.name,
        participants: Array.from(participants.values()),
      });

      console.log(`[socket] User ${user.name} left meeting ${meetingId} (disconnect)`);

      // Clean up empty rooms
      if (participants.size === 0) {
        meetingRooms.delete(meetingId);
        console.log(`[socket] Room meeting:${meetingId} cleaned up (empty)`);
      }
    }
  }
}

// ─── AI Pipeline helpers (lazy-loaded via dynamic import) ───────────────────

/** @type {null | Function} */
let _extractEntities = null;
/** @type {null | Function} */
let _retrieveContext = null;
/** @type {null | Function} */
let _detectContradictions = null;
/** @type {null | Function} */
let _generateMeetingSummary = null;
/** @type {null | Function} */
let _queryMemory = null;
/** @type {null | Function} */
let _upsertTranscriptSegment = null;
/** @type {null | Object} */
let _memoryStore = null;

async function loadPipeline() {
  try {
    if (!_extractEntities) {
      const mod = await import('./ai/extractor.js');
      _extractEntities = mod.extractEntities;
    }
  } catch (e) {
    console.warn('[socket] AI extractor not available yet:', e.message);
  }

  try {
    if (!_retrieveContext) {
      const mod = await import('./ai/retriever.js');
      _retrieveContext = mod.retrieveContext;
    }
  } catch (e) {
    console.warn('[socket] AI retriever not available yet:', e.message);
  }

  try {
    if (!_detectContradictions) {
      const mod = await import('./ai/contradiction.js');
      _detectContradictions = mod.detectContradictions;
    }
  } catch (e) {
    console.warn('[socket] AI contradiction detector not available yet:', e.message);
  }

  try {
    if (!_generateMeetingSummary) {
      const mod = await import('./ai/summarizer.js');
      _generateMeetingSummary = mod.generateMeetingSummary;
    }
  } catch (e) {
    console.warn('[socket] AI summarizer not available yet:', e.message);
  }

  try {
    if (!_queryMemory) {
      const mod = await import('./ai/query.js');
      _queryMemory = mod.queryMemory;
    }
  } catch (e) {
    console.warn('[socket] AI query engine not available yet:', e.message);
  }

  try {
    if (!_upsertTranscriptSegment) {
      const mod = await import('./ai/pinecone.js');
      _upsertTranscriptSegment = mod.upsertTranscriptSegment;
    }
  } catch (e) {
    console.warn('[socket] Pinecone indexing helper not available yet:', e.message);
  }

  try {
    if (!_memoryStore) {
      const mod = await import('./memory-store.js');
      _memoryStore = mod.default;
    }
  } catch (e) {
    console.warn('[socket] Memory store not available yet:', e.message);
  }
}

// ─── Main setup ─────────────────────────────────────────────────────────────

/**
 * Set up all Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 */
module.exports = function setupSocketHandlers(io) {
  // ── Authentication middleware ───────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.warn('[socket] Connection rejected: no auth token');
      return next(new Error('Authentication required'));
    }

    try {
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (verifyErr) {
        // Fall back to Firebase Admin SDK to verify the Firebase ID Token securely
        try {
          const firebaseUser = await admin.auth().verifyIdToken(token);
          
          const email = firebaseUser.email || '';
          let role = 'member';
          let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef'];

          if (email.startsWith('priya@') || email.includes('admin') || email === 'patel.priya@gmail.com') {
            role = 'org_admin';
            teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'];
          }

          decoded = {
            userId: firebaseUser.uid,
            orgId: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
            teamIds,
            role,
            email,
            name: firebaseUser.name || email.split('@')[0],
          };
        } catch (firebaseErr) {
          console.warn('[socket] Firebase Admin SDK verification failed, using decode fallback:', firebaseErr.message);
          
          // Fall back to decoding Firebase token (e.g. for offline local dev)
          decoded = jwt.decode(token);
          if (!decoded || !decoded.email) {
            throw new Error('Invalid token structure');
          }

          const email = decoded.email;
          let role = 'member';
          let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef'];

          if (email.startsWith('priya@') || email.includes('admin') || email === 'patel.priya@gmail.com') {
            role = 'org_admin';
            teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'];
          }

          decoded = {
            userId: decoded.sub || decoded.user_id || 'offline_user',
            orgId: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
            teamIds,
            role,
            email,
            name: decoded.name || email.split('@')[0],
          };
        }
      }

      socket.data.user = {
        userId: decoded.userId || decoded.sub,
        orgId: decoded.orgId,
        teamIds: decoded.teamIds || [],
        role: decoded.role || 'member',
        email: decoded.email,
        name: decoded.name || decoded.email,
      };
      console.log(`[socket] Authenticated: ${socket.data.user.name} (${socket.id})`);
      next();
    } catch (err) {
      console.warn('[socket] Connection rejected: invalid token -', err.message);
      return next(new Error('Invalid authentication token'));
    }
  });

  // Preload AI pipeline modules (non-blocking)
  loadPipeline();

  // ── Connection handler ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[socket] Connected: ${user.name} (${socket.id})`);

    // ── join-meeting ────────────────────────────────────────────────────
    socket.on('join-meeting', async (data, ack) => {
      try {
        const { meetingId } = data;
        if (!meetingId) {
          throw new Error('meetingId is required');
        }

        const roomKey = `meeting:${meetingId}`;
        await socket.join(roomKey);

        const room = getRoom(meetingId);
        room.set(socket.id, {
          userId: user.userId,
          name: user.name,
          joinedAt: new Date(),
        });

        const participants = Array.from(room.values());

        console.log(
          `[socket] ${user.name} joined meeting ${meetingId} (${participants.length} participants)`
        );

        // Notify others in the room
        socket.to(roomKey).emit('meeting:participant-joined', {
          userId: user.userId,
          name: user.name,
          participants,
        });

        // Send current state to the joining client
        const response = {
          meetingId,
          participants,
          transcript: [],
          status: 'active',
        };

        if (typeof ack === 'function') {
          ack({ success: true, data: response });
        }

        socket.emit('meeting:joined', response);
      } catch (err) {
        console.error('[socket] join-meeting error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── leave-meeting ───────────────────────────────────────────────────
    socket.on('leave-meeting', async (data, ack) => {
      try {
        const { meetingId } = data;
        if (!meetingId) {
          throw new Error('meetingId is required');
        }

        const roomKey = `meeting:${meetingId}`;
        await socket.leave(roomKey);

        const room = getRoom(meetingId);
        room.delete(socket.id);

        const participants = Array.from(room.values());

        io.to(roomKey).emit('meeting:participant-left', {
          userId: user.userId,
          name: user.name,
          participants,
        });

        // Clean up empty rooms
        if (participants.length === 0) {
          meetingRooms.delete(meetingId);
          console.log(`[socket] Room ${roomKey} cleaned up (empty)`);
        }

        console.log(`[socket] ${user.name} left meeting ${meetingId}`);

        if (typeof ack === 'function') {
          ack({ success: true });
        }
      } catch (err) {
        console.error('[socket] leave-meeting error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── transcript:chunk ────────────────────────────────────────────────
    socket.on('transcript:chunk', async (data, ack) => {
      try {
        const { meetingId, chunk } = data;
        if (!meetingId || !chunk) {
          throw new Error('meetingId and chunk are required');
        }

        const enrichedChunk = {
          id: chunk.id || `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          speaker: chunk.speaker || user.name,
          speakerId: chunk.speakerId || user.userId,
          text: chunk.text,
          timestamp: chunk.timestamp || new Date().toISOString(),
          meetingId,
        };

        console.log(
          `[socket] Transcript chunk in ${meetingId}: "${enrichedChunk.text.slice(0, 60)}..."`
        );

        // Broadcast the chunk to all participants in the room
        const roomKey = `meeting:${meetingId}`;
        io.to(roomKey).emit('transcript:chunk', enrichedChunk);
        // Store chunk in database and memory store in background
        setImmediate(async () => {
          try {
            await loadPipeline();
            try {
              const db = await import('./db.js');
              await db.query(
                `INSERT INTO transcript_segments (id, meeting_id, speaker_user_id, speaker_name, text, start_ts, end_ts)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [enrichedChunk.id, meetingId, enrichedChunk.speakerId, enrichedChunk.speaker, enrichedChunk.text, 0.0, 0.0]
              );
            } catch (dbErr) {
              console.warn('[socket] Database save failed, falling back to memory store:', dbErr.message);
              if (_memoryStore) {
                _memoryStore.addTranscript({
                  id: enrichedChunk.id,
                  meetingId,
                  speaker: enrichedChunk.speaker,
                  speakerId: enrichedChunk.speakerId,
                  text: enrichedChunk.text,
                  start: 0,
                  end: 0,
                  capturedAt: enrichedChunk.timestamp,
                });
              }
            }
          } catch (storeErr) {
            console.warn('[socket] Failed to store transcript chunk:', storeErr.message);
          }
        });

        // Run AI pipeline in background (non-blocking for the client)
        setImmediate(async () => {
          await loadPipeline();

          // 1. Entity extraction
          if (_extractEntities) {
            try {
              const entities = await _extractEntities(enrichedChunk.text, {
                meetingId,
                speaker: enrichedChunk.speaker,
                timestamp: enrichedChunk.timestamp,
              });

              if (entities && entities.length > 0) {
                console.log(
                  `[socket] Extracted ${entities.length} entities from chunk ${enrichedChunk.id}`
                );
                io.to(roomKey).emit('entities:extracted', {
                  chunkId: enrichedChunk.id,
                  entities,
                });
              }
            } catch (err) {
              console.error('[socket] Entity extraction error:', err.message);
            }
          }

          // 2. Proactive context retrieval
          if (_retrieveContext) {
            try {
              const contextCards = await _retrieveContext(enrichedChunk.text, {
                meetingId,
                orgId: user.orgId,
                teamIds: user.teamIds,
              });

              if (contextCards && contextCards.length > 0) {
                console.log(
                  `[socket] ${contextCards.length} context cards for chunk ${enrichedChunk.id}`
                );
                for (const card of contextCards) {
                  io.to(roomKey).emit('context:card', {
                    ...card,
                    chunkId: enrichedChunk.id,
                  });
                }
              }
            } catch (err) {
              console.error('[socket] Context retrieval error:', err.message);
            }
          }

          // 3. Contradiction detection on decision candidates
          if (_detectContradictions) {
            try {
              const contradictions = await _detectContradictions(enrichedChunk.text, {
                meetingId,
                orgId: user.orgId,
                teamIds: user.teamIds,
                speaker: enrichedChunk.speaker,
              });

              if (contradictions && contradictions.length > 0) {
                console.log(
                  `[socket] ${contradictions.length} contradictions for chunk ${enrichedChunk.id}`
                );
                for (const contradiction of contradictions) {
                  io.to(roomKey).emit('contradiction:card', {
                    ...contradiction,
                    chunkId: enrichedChunk.id,
                  });
                }
              }
            } catch (err) {
              console.error('[socket] Contradiction detection error:', err.message);
            }
          }

          // 4. Index to Pinecone Vector database
          if (_upsertTranscriptSegment) {
            try {
              let meetingTitle = 'Meeting';
              try {
                const db = await import('./db.js');
                const mRes = await db.query('SELECT title FROM meetings WHERE id = $1', [meetingId]);
                if (mRes.rows.length > 0) {
                  meetingTitle = mRes.rows[0].title;
                }
              } catch (dbErr) {
                if (_memoryStore) {
                  const meeting = _memoryStore.getMeeting(meetingId);
                  if (meeting) {
                    meetingTitle = meeting.title;
                  }
                }
              }

              const teamId = user.teamIds?.[0] || 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef';
              await _upsertTranscriptSegment({
                id: enrichedChunk.id,
                meetingId: enrichedChunk.meetingId,
                text: enrichedChunk.text,
                speaker: enrichedChunk.speaker,
                start: 0,
                end: 0,
                capturedAt: enrichedChunk.timestamp
              }, teamId, meetingTitle);
            } catch (err) {
              console.error('[socket] Pinecone indexing error:', err.message);
            }
          }
        });

        if (typeof ack === 'function') {
          ack({ success: true, chunkId: enrichedChunk.id });
        }
      } catch (err) {
        console.error('[socket] transcript:chunk error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── decision:confirm ────────────────────────────────────────────────
    socket.on('decision:confirm', async (data, ack) => {
      try {
        const { meetingId, decisionId, action, editedText } = data;
        if (!meetingId || !decisionId || !action) {
          throw new Error('meetingId, decisionId, and action are required');
        }

        const validActions = ['confirm', 'edit', 'dismiss'];
        if (!validActions.includes(action)) {
          throw new Error(`action must be one of: ${validActions.join(', ')}`);
        }

        console.log(
          `[socket] Decision ${decisionId} ${action}ed by ${user.name} in ${meetingId}`
        );

        const decisionUpdate = {
          decisionId,
          action,
          editedText: action === 'edit' ? editedText : undefined,
          confirmedBy: user.userId,
          confirmedByName: user.name,
          confirmedAt: new Date().toISOString(),
        };

        // Broadcast decision update to room
        const roomKey = `meeting:${meetingId}`;
        io.to(roomKey).emit('decision:updated', decisionUpdate);

        if (typeof ack === 'function') {
          ack({ success: true, data: decisionUpdate });
        }
      } catch (err) {
        console.error('[socket] decision:confirm error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── query:ask ───────────────────────────────────────────────────────
    socket.on('query:ask', async (data, ack) => {
      try {
        const { meetingId, question } = data;
        if (!question) {
          throw new Error('question is required');
        }

        console.log(
          `[socket] Query from ${user.name}: "${question.slice(0, 80)}..."`
        );

        const queryId = `query_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Acknowledge receipt immediately
        if (typeof ack === 'function') {
          ack({ success: true, queryId });
        }

        // Send a "thinking" state
        socket.emit('query:thinking', { queryId, question });

        await loadPipeline();

        if (_queryMemory) {
          try {
            const answer = await _queryMemory(question, {
              meetingId,
              orgId: user.orgId,
              userId: user.userId,
              teamIds: user.teamIds,
            });

            socket.emit('query:answer', {
              queryId,
              question,
              answer: answer.text || answer,
              sources: answer.sources || [],
              timestamp: new Date().toISOString(),
            });

            console.log(`[socket] Query ${queryId} answered`);
          } catch (err) {
            console.error('[socket] Query pipeline error:', err.message);
            socket.emit('query:answer', {
              queryId,
              question,
              answer:
                'I wasn\'t able to find an answer right now. The AI pipeline may still be initializing.',
              sources: [],
              error: true,
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          socket.emit('query:answer', {
            queryId,
            question,
            answer:
              'The AI query pipeline is not available yet. It will be ready once the AI modules are configured.',
            sources: [],
            error: true,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('[socket] query:ask error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── meeting:end ─────────────────────────────────────────────────────
    socket.on('meeting:end', async (data, ack) => {
      try {
        const { meetingId } = data;
        if (!meetingId) {
          throw new Error('meetingId is required');
        }

        console.log(`[socket] Meeting ${meetingId} ended by ${user.name}`);

        const roomKey = `meeting:${meetingId}`;

        // Notify all participants that the meeting is ending
        io.to(roomKey).emit('meeting:ending', {
          meetingId,
          endedBy: user.name,
        });

        await loadPipeline();

        // End meeting in memory store and database
        if (_memoryStore) {
          _memoryStore.endMeeting(meetingId);
        }
        try {
          const db = await import('./db.js');
          await db.query(`UPDATE meetings SET status = 'ended', ended_at = NOW() WHERE id = $1`, [meetingId]);
        } catch (dbErr) {
          console.warn('[socket] Failed to end meeting in Postgres:', dbErr.message);
        }

        let summary = null;
        if (_generateMeetingSummary) {
          try {
            summary = await _generateMeetingSummary(meetingId, {
              orgId: user.orgId,
            });
            console.log(`[socket] Summary generated for meeting ${meetingId}`);
          } catch (err) {
            console.error('[socket] Summary generation error:', err.message);
          }
        }

        // Broadcast meeting ended with summary
        io.to(roomKey).emit('meeting:ended', {
          meetingId,
          endedBy: user.name,
          endedAt: new Date().toISOString(),
          summary: summary || null,
        });

        // Clean up room
        const room = getRoom(meetingId);
        for (const [sid] of room) {
          const s = io.sockets.sockets.get(sid);
          if (s) {
            s.leave(roomKey);
          }
        }
        meetingRooms.delete(meetingId);
        console.log(`[socket] Room ${roomKey} cleaned up (meeting ended)`);

        if (typeof ack === 'function') {
          ack({ success: true, summary: summary || null });
        }
      } catch (err) {
        console.error('[socket] meeting:end error:', err.message);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // ── Disconnection ───────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[socket] Disconnected: ${user.name} (${socket.id}) - ${reason}`);
      removeFromAllRooms(socket.id, io);
    });

    // ── Error handler ───────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[socket] Socket error for ${user.name}:`, err.message);
    });
  });

  // ── Server-level error handling ─────────────────────────────────────────
  io.engine.on('connection_error', (err) => {
    console.error('[socket] Connection error:', err.code, err.message);
  });

  console.log('[socket] Socket.IO handlers initialized');
};
