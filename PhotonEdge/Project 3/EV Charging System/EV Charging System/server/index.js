const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// ============================================
// CRASH-PROOF SMART EV BACKEND SERVER
// ============================================

console.log('\n🚀 Starting Smart EV Auto-Reservation Platform...\n');

const app = express();
let server;
let io;

// ============================================
// MIDDLEWARE SETUP
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// ============================================
// PORT FALLBACK LOGIC
// ============================================
const PORTS = [3000, 3001, 3002, 3003];
let currentPortIndex = 0;

async function findAvailablePort() {
  return new Promise((resolve) => {
    if (currentPortIndex >= PORTS.length) {
      console.error('❌ All ports exhausted. Cannot start server.');
      process.exit(1);
    }

    const port = PORTS[currentPortIndex];
    const testServer = http.createServer();

    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is busy, trying next...`);
        currentPortIndex++;
        testServer.close();
        resolve(findAvailablePort());
      } else {
        console.error(`❌ Error testing port ${port}:`, err.message);
        currentPortIndex++;
        testServer.close();
        resolve(findAvailablePort());
      }
    });

    testServer.once('listening', () => {
      testServer.close();
      resolve(port);
    });

    testServer.listen(port);
  });
}

// ============================================
// DATABASE INITIALIZATION
// ============================================
async function initializeDatabase() {
  try {
    console.log('📊 Initializing SQLite database...');
    const { initDB, db } = require('./src/config/db');

    // Initialize tables
    await new Promise((resolve, reject) => {
      initDB();
      // Wait a bit for tables to be created
      setTimeout(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='chargers'", (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            console.log('✅ Database tables verified');
            resolve();
          } else {
            reject(new Error('Tables not created'));
          }
        });
      }, 500);
    });

    // Seed chargers if empty
    console.log('🔌 Checking charger data...');
    const { seedChargers } = require('./src/services/chargerService');
    await new Promise((resolve) => {
      seedChargers();
      setTimeout(resolve, 500);
    });
    console.log('✅ Charger data ready');

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Attempting to continue anyway...');
    return false;
  }
}

// ============================================
// SOCKET.IO SETUP
// ============================================
function setupSocketIO(httpServer) {
  try {
    const socketIO = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    socketIO.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      socket.on('disconnect', (reason) => {
        console.log('🔌 Client disconnected:', socket.id, '- Reason:', reason);
      });

      socket.on('error', (error) => {
        console.error('⚠️  Socket error:', error.message);
      });
    });

    console.log('✅ Socket.IO initialized');
    return socketIO;
  } catch (error) {
    console.error('❌ Socket.IO setup failed:', error.message);
    throw error;
  }
}

// ============================================
// API ROUTES SETUP
// ============================================
function setupRoutes(socketIO) {
  try {
    const apiRoutes = require('./src/routes/api');
    app.use('/api', apiRoutes(socketIO));
    console.log('✅ API routes configured');

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        socket: 'active'
      });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        message: 'Smart EV Auto-Reservation Platform API',
        version: '1.0.0',
        status: 'running'
      });
    });

    return true;
  } catch (error) {
    console.error('❌ Routes setup failed:', error.message);
    throw error;
  }
}

// ============================================
// AUTO-CLEANUP SCHEDULER
// ============================================
function startScheduler(socketIO) {
  try {
    const { db } = require('./src/config/db');

    setInterval(() => {
      const now = new Date().toISOString();
      db.all("SELECT * FROM reservations WHERE status = 'active' AND expiry < ?", [now], (err, rows) => {
        if (err) {
          console.error("⚠️  Scheduler Error:", err.message);
          return;
        }

        if (rows && rows.length > 0) {
          rows.forEach(res => {
            // Mark as expired
            db.run("UPDATE reservations SET status = 'expired' WHERE id = ?", [res.id]);

            // Release charger
            db.run("UPDATE chargers SET available = 1 WHERE id = ?", [res.charger_id]);

            // Notify clients
            socketIO.emit('charger_update', { id: res.charger_id, available: 1 });
            console.log(`⏰ [Scheduler] Expired Reservation ${res.id}. Released Charger ${res.charger_id}.`);
          });
        }
      });
    }, 60000); // Every 60 seconds

    console.log('✅ Auto-cleanup scheduler started (60s intervals)');
  } catch (error) {
    console.error('⚠️  Scheduler setup failed:', error.message);
    console.log('⚠️  Server will continue without scheduler');
  }
}

// ============================================
// GRACEFUL ERROR HANDLING
// ============================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
function setupGracefulShutdown() {
  const shutdown = () => {
    console.log('\n⏹️  Shutting down gracefully...');

    if (io) {
      io.close(() => {
        console.log('✅ Socket.IO connections closed');
      });
    }

    if (server) {
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// ============================================
// MAIN SERVER STARTUP
// ============================================
async function startServer() {
  try {
    // Step 1: Initialize Database
    await initializeDatabase();

    // Step 2: Find available port
    const PORT = await findAvailablePort();
    console.log(`✅ Port ${PORT} available`);

    // Step 3: Create HTTP server
    server = http.createServer(app);
    console.log('✅ HTTP server created');

    // Step 4: Setup Socket.IO
    io = setupSocketIO(server);

    // Step 5: Setup routes
    setupRoutes(io);

    // Step 6: Start listening
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(PORT, () => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log(`║  🚀 Server running on port ${PORT}           ║`);
        console.log('║  📡 Socket.IO: Active                     ║');
        console.log('║  💾 Database: Connected                   ║');
        console.log('║  🔌 Chargers: Seeded                      ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log(`🌐 API: http://localhost:${PORT}`);
        console.log(`🔍 Health Check: http://localhost:${PORT}/health\n`);
        resolve();
      });
    });

    // Step 7: Start scheduler
    startScheduler(io);

    // Step 8: Setup graceful shutdown
    setupGracefulShutdown();

    console.log('✅ Server startup complete!\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR during startup:', error.message);
    console.error(error.stack);
    console.log('\n⚠️  Please check:');
    console.log('   1. All npm dependencies are installed (npm install)');
    console.log('   2. No other process is using ports 3000-3003');
    console.log('   3. Database directory is writable');
    console.log('   4. All required files exist in src/ directory\n');
    process.exit(1);
  }
}

// ============================================
// START THE SERVER
// ============================================
startServer();
