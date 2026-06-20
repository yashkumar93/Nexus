const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: dev ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ['websocket', 'polling'],
  });

  // Make io available globally so API routes can emit events
  global.io = io;

  // Import and setup socket handlers
  const setupSocketHandlers = require('./src/lib/socket-handler.js');
  setupSocketHandlers(io);

  server.listen(port, hostname, () => {
    console.log(
      `> Continuum ready on http://${hostname}:${port} as ${
        dev ? 'development' : 'production'
      }`
    );
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n> Received ${signal}, shutting down gracefully...`);
    io.close(() => {
      server.close(() => {
        console.log('> Server closed');
        process.exit(0);
      });
    });
    // Force exit after 10s
    setTimeout(() => {
      console.error('> Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
