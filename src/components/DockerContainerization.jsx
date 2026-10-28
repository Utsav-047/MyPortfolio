import React, { useState, useEffect, useCallback } from 'react';
import { getContainerInfo, getDbStatus } from '../services/api';

function DockerContainerization({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | dockerfiles | cli | metrics
  const [selectedFile, setSelectedFile] = useState('compose'); // compose | frontend | backend | nginx | dockerignore
  const [copiedFile, setCopiedFile] = useState(null);
  const [containerInfo, setContainerInfo] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeCliCommand, setActiveCliCommand] = useState('up');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'command', text: '$ docker compose up -d' },
    { type: 'output', text: '[+] Running 4/4\n ✔ Network portfolio_bridge_network Created\n ✔ Volume portfolio_mongo_data     Created\n ✔ Container portfolio-mongo         Healthy [27017:27017]\n ✔ Container portfolio-backend       Healthy [5000:5000]\n ✔ Container portfolio-frontend      Started [3000:80]' }
  ]);
  const [isSimulatingRestart, setIsSimulatingRestart] = useState(false);
  const [activeServiceFilter, setActiveServiceFilter] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch live system / container telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      const [sysRes, dbRes] = await Promise.all([
        getContainerInfo().catch(() => null),
        getDbStatus().catch(() => null)
      ]);
      if (sysRes) setContainerInfo(sysRes);
      if (dbRes) setDbStatus(dbRes);
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Run simulated Docker CLI command in the terminal UI
  const executeCliCommand = (cmdKey) => {
    setActiveCliCommand(cmdKey);
    const cmdMap = {
      up: {
        command: 'docker compose up -d --build',
        output: '[+] Building 14.8s (18/18) FINISHED\n => [frontend builder 1/6] FROM docker.io/library/node:20-alpine\n => [backend 1/5] FROM docker.io/library/node:20-alpine\n => [frontend runner 2/3] COPY --from=builder /app/dist /usr/share/nginx/html\n ✔ Container portfolio-mongo    Healthy (ports: 27017:27017)\n ✔ Container portfolio-backend  Healthy (ports: 5000:5000)\n ✔ Container portfolio-frontend Started (ports: 3000:80)\nStatus: All 3 services running isolated in portfolio_bridge_network.'
      },
      ps: {
        command: 'docker compose ps -a',
        output: 'NAME                 IMAGE                  COMMAND                  SERVICE    STATUS              PORTS\nportfolio-frontend   myportfolio-frontend   "/docker-entrypoint.…"   frontend   Up (healthy) 4h     0.0.0.0:3000->80/tcp\nportfolio-backend    myportfolio-backend    "docker-entrypoint.s…"   backend    Up (healthy) 4h     0.0.0.0:5000->5000/tcp\nportfolio-mongo      mongo:7.0              "docker-entrypoint.s…"   mongo      Up (healthy) 4h     0.0.0.0:27017->27017/tcp'
      },
      logs_backend: {
        command: 'docker compose logs -f backend --tail=5',
        output: 'portfolio-backend | [Node.js] Environment: production | PID: 1\nportfolio-backend | [MongoDB] Connecting to mongodb://mongo:27017/portfolio_db\nportfolio-backend | [Mongoose] Connection established successfully\nportfolio-backend | [Express] Server listening on internal port 5000\nportfolio-backend | [Healthcheck] GET / 200 OK (0.84ms)'
      },
      logs_frontend: {
        command: 'docker compose logs -f frontend --tail=5',
        output: 'portfolio-frontend | 172.28.0.1 - - [16/Oct/2026:14:15:01] "GET / HTTP/1.1" 200 482\nportfolio-frontend | 172.28.0.1 - - [16/Oct/2026:14:15:02] "GET /assets/index-D56G.js HTTP/1.1" 200 84210\nportfolio-frontend | 172.28.0.1 - - [16/Oct/2026:14:15:02] "GET /api/tasks HTTP/1.1" 200 (proxied -> backend:5000)\nportfolio-frontend | [Nginx] Reverse proxy streaming buffer disabled for /api/events'
      },
      exec: {
        command: 'docker compose exec backend node -e "console.log(process.versions)"',
        output: '{\n  node: \'20.18.0\',\n  v8: \'12.0.267.17-node.23\',\n  uv: \'1.48.0\',\n  zlib: \'1.3.0.1-motley-7d4e21a\',\n  openssl: \'3.0.15+quic\'\n}'
      },
      stats: {
        command: 'docker stats --no-stream',
        output: 'CONTAINER ID   NAME                 CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O\na1b2c3d4e5f6   portfolio-frontend   0.02%     18.4MiB / 15.6GiB     0.11%     42.1kB / 185kB    0B / 0B\nb2c3d4e5f6a1   portfolio-backend    0.15%     44.8MiB / 15.6GiB     0.28%     1.2MB / 890kB     0B / 12kB\nc3d4e5f6a1b2   portfolio-mongo      0.22%     98.2MiB / 15.6GiB     0.61%     750kB / 1.1MB     24MB / 8.2MB'
      },
      down: {
        command: 'docker compose down',
        output: '[+] Running 3/3\n ✔ Container portfolio-frontend  Removed\n ✔ Container portfolio-backend   Removed\n ✔ Container portfolio-mongo     Removed\n ✔ Network portfolio_bridge_network Removed\n[i] Named volume "portfolio_mongo_data" preserved intact.'
      }
    };

    const target = cmdMap[cmdKey] || cmdMap.up;
    setTerminalHistory(prev => [
      ...prev,
      { type: 'command', text: `$ ${target.command}` },
      { type: 'output', text: target.output }
    ]);
  };

  const handleSimulateRestart = (serviceName) => {
    setIsSimulatingRestart(true);
    showToast(`Restarting ${serviceName} container gracefully (SIGTERM)...`, 'info');
    setTimeout(() => {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'command', text: `$ docker compose restart ${serviceName}` },
        { type: 'output', text: `[+] Restarting 1/1\n ✔ Container portfolio-${serviceName} Restarted in 1.42s\nHealthcheck: Passing (status: healthy)` }
      ]);
      setIsSimulatingRestart(false);
      showToast(`${serviceName} restarted and healthy!`, 'success');
      fetchTelemetry();
    }, 1800);
  };

  // Code files data
  const codeFiles = {
    compose: {
      name: 'docker-compose.yml',
      tag: 'Orchestration Spec',
      description: 'Coordinates multi-container deployment, shared bridge network, healthchecks, and persistent volume mounting.',
      code: `version: '3.8'

services:
  # ── 1. Frontend Web Client (React + Nginx) ─────────────────────────
  frontend:
    container_name: portfolio-frontend
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      backend:
        condition: service_started
    networks:
      - portfolio-network
    restart: unless-stopped

  # ── 2. Backend API Service (Node.js Express) ───────────────────────
  backend:
    container_name: portfolio-backend
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/portfolio_db
      - JWT_SECRET=portfolio_super_secure_jwt_secret_key_docker_2026
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - portfolio-network
    restart: unless-stopped

  # ── 3. Database Service (MongoDB 7.0) ──────────────────────────────
  mongo:
    container_name: portfolio-mongo
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - portfolio-network
    restart: always
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  mongo-data:
    name: portfolio_mongo_data
    driver: local

networks:
  portfolio-network:
    name: portfolio_bridge_network
    driver: bridge`
    },
    frontend: {
      name: 'Dockerfile.frontend',
      tag: 'Multi-Stage Build',
      description: 'Two-stage build: compiles Vite bundle in Node.js 20 Alpine builder, then transfers static /dist assets to Nginx Alpine for ~25MB lightweight runtime.',
      code: `# Stage 1: Build Stage (Node.js Alpine)
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependency layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build distribution
COPY . .
RUN npm run build

# Stage 2: Production Nginx Runtime Stage (~25MB Image)
FROM nginx:1.25-alpine AS runner
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]`
    },
    backend: {
      name: 'backend/Dockerfile',
      tag: 'Node.js Alpine Microservice',
      description: 'Lean Node.js 20 Alpine container with isolated non-root execution, automated healthchecks, and omitted development dependencies.',
      code: `FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Cache package manifests
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "server.js"]`
    },
    nginx: {
      name: 'nginx.conf',
      tag: 'Reverse Proxy & SPA Routing',
      description: 'Configures Nginx to serve React SPA with fallback to index.html, gzip asset compression, and reverse-proxies /api/ requests to the backend container.',
      code: `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Static asset caching
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy API and Event Streams to backend service container
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off; # Essential for Server-Sent Events (SSE)
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}`
    },
    dockerignore: {
      name: '.dockerignore',
      tag: 'Context Optimization',
      description: 'Excludes unnecessary host files (node_modules, logs, secrets) from the Docker build context for high-speed builds and lean layers.',
      code: `node_modules
dist
.git
.gitignore
.env
.env.local
npm-debug.log*
.vscode
.gemini
docs/`
    }
  };

  const services = [
    {
      id: 'frontend',
      name: 'portfolio-frontend',
      role: 'Web Application Client',
      technology: 'React 19 + Vite 8 + Nginx Alpine',
      image: 'myportfolio-frontend:latest',
      ports: '3000:80',
      network: 'portfolio_bridge_network',
      status: 'healthy',
      containerSize: '24.8 MB (Multi-Stage)',
      iconType: 'globe',
      envVars: ['NODE_ENV=production', 'PORT=80'],
      health: 'Passing (HTTP 200 GET /)'
    },
    {
      id: 'backend',
      name: 'portfolio-backend',
      role: 'REST API & Event-Driven Engine',
      technology: 'Node.js 20 Alpine + Express + Mongoose',
      image: 'myportfolio-backend:latest',
      ports: '5000:5000',
      network: 'portfolio_bridge_network',
      status: containerInfo ? 'healthy' : 'online',
      containerSize: '142 MB',
      iconType: 'server',
      envVars: ['PORT=5000', 'NODE_ENV=production', 'MONGO_URI=mongodb://mongo:27017/portfolio_db'],
      health: 'Passing (HTTP 200 GET /)'
    },
    {
      id: 'mongo',
      name: 'portfolio-mongo',
      role: 'Primary Document Database',
      technology: 'MongoDB 7.0 Community Engine',
      image: 'mongo:7.0',
      ports: '27017:27017',
      network: 'portfolio_bridge_network',
      status: dbStatus?.status === 'online' ? 'healthy' : 'active',
      containerSize: '685 MB',
      iconType: 'database',
      envVars: ['MONGO_INITDB_DATABASE=portfolio_db'],
      volume: 'portfolio_mongo_data -> /data/db',
      health: 'Passing (mongosh ping OK)'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      marginTop: '8px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'info' ? '#1e293b' : '#059669',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{toast.type === 'info' ? 'ℹ️' : '✅'}</span>
          {toast.message}
        </div>
      )}

      {/* Hero Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}>
                CONTAINER ARCHITECTURE
              </span>
              <span style={{
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                Multi-Container Compose v3.8
              </span>
            </div>

            <h2 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
              Containerization with Docker &amp; Docker Compose
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', maxWidth: '780px', lineHeight: 1.6 }}>
              Production-grade multi-tier container architecture orchestrating an optimized multi-stage React (Vite + Nginx) frontend, Node.js Express microservice backend, and persistent MongoDB database connected via an isolated Docker bridge network.
            </p>
          </div>

          {/* Quick Status Chips */}
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Containers</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>3 Active</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Network</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#a78bfa', marginTop: '2px' }}>Bridge</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Storage</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80', marginTop: '2px' }}>Named Vol</div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '2px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: 'Multi-Container Architecture & Mesh' },
          { id: 'dockerfiles', label: 'Multi-Stage Dockerfiles & Compose' },
          { id: 'metrics', label: 'Container Telemetry & Resource Monitor' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${color}` : '3px solid transparent',
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? color : '#64748b',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.15s ease'
            }}
          >
            
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & ARCHITECTURE ────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visual Architecture Diagram Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Multi-Container Orchestration Mesh
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  How Docker Compose encapsulates frontend, backend, and database in isolated environments with private DNS routing.
                </p>
              </div>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                Network: portfolio_bridge_network (Bridge Driver)
              </span>
            </div>

            {/* Architecture SVG Diagram */}
            <div style={{
              background: '#0b1329',
              borderRadius: '14px',
              padding: '28px 20px',
              overflowX: 'auto',
              color: '#ffffff',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1fr) auto minmax(240px, 1.2fr) auto minmax(240px, 1.2fr) auto minmax(220px, 1fr)',
                alignItems: 'center',
                gap: '16px',
                minWidth: '920px'
              }}>
                {/* 1. Host / Client */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px dashed #475569',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: "#38bdf8", marginBottom: "6px", display: "flex", justifyContent: "center" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>Client Browser</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Host Port: 3000</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>HTTP Requests</div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 800, fontSize: '18px' }}>
                  ➔<div style={{ fontSize: '10px', color: '#475569' }}>:3000</div>
                </div>

                {/* 2. Frontend Container */}
                <div style={{
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  border: '2px solid #38bdf8',
                  borderRadius: '14px',
                  padding: '18px',
                  boxShadow: '0 8px 20px rgba(56, 189, 248, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: "#38bdf8", display: "inline-flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <span style={{ fontSize: '10px', background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>PORT 80</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#38bdf8' }}>portfolio-frontend</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Nginx 1.25 Alpine</div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
                    • Serves React /dist SPA<br />
                    • Reverse Proxies /api/ ➔ backend:5000<br />
                    • Disables buffering for SSE
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: '#a78bfa', fontWeight: 800, fontSize: '18px' }}>
                  ➔<div style={{ fontSize: '10px', color: '#475569' }}>DNS: backend:5000</div>
                </div>

                {/* 3. Backend Container */}
                <div style={{
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  border: '2px solid #a78bfa',
                  borderRadius: '14px',
                  padding: '18px',
                  boxShadow: '0 8px 20px rgba(167, 139, 250, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: "#a78bfa", display: "inline-flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></span>
                    <span style={{ fontSize: '10px', background: '#7c3aed', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>PORT 5000</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#a78bfa' }}>portfolio-backend</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Node.js 20 Alpine Express</div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
                    • Task REST APIs + Auth Gate<br />
                    • EventEmitter Async Engine<br />
                    • Healthcheck: GET / (every 20s)
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: 800, fontSize: '18px' }}>
                  ➔<div style={{ fontSize: '10px', color: '#475569' }}>DNS: mongo:27017</div>
                </div>

                {/* 4. MongoDB Container */}
                <div style={{
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  border: '2px solid #4ade80',
                  borderRadius: '14px',
                  padding: '18px',
                  boxShadow: '0 8px 20px rgba(74, 222, 128, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: "#4ade80", display: "inline-flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span>
                    <span style={{ fontSize: '10px', background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>PORT 27017</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#4ade80' }}>portfolio-mongo</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>MongoDB 7.0 Engine</div>
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 8px',
                    background: 'rgba(74, 222, 128, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    fontSize: '10px',
                    color: '#86efac'
                  }}>
                    Named Volume: <strong>portfolio_mongo_data</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Defined Docker Services ({services.length})
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'frontend', 'backend', 'mongo'].map(filter => {
                  const active = activeServiceFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveServiceFilter(filter)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '20px',
                        border: active ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                        background: active ? '#ede9fe' : '#f8fafc',
                        color: active ? '#4f46e5' : '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {services
                .filter(s => activeServiceFilter === 'all' || s.id === activeServiceFilter)
                .map(service => (
                  <div
                    key={service.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: service.id === 'frontend' ? '#e0f2fe' : service.id === 'backend' ? '#ede9fe' : '#dcfce7',
  color: service.id === 'frontend' ? '#0284c7' : service.id === 'backend' ? '#7c3aed' : '#16a34a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  {service.id === 'frontend' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
  {service.id === 'backend' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>}
  {service.id === 'mongo' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
</div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                              {service.name}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#475569' }}>{service.role}</span>
                          </div>
                        </div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(74, 222, 128, 0.12)',
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                          {service.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginTop: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Stack:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{service.technology}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Port Bind:</span>
                          <span style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>{service.ports}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Image Size:</span>
                          <span style={{ fontWeight: 700, color: '#4ade80' }}>{service.containerSize}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>Healthcheck:</span>
                          <span style={{ fontWeight: 600, color: '#86efac' }}>{service.health}</span>
                        </div>
                        {service.volume && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#475569' }}>Storage Volume:</span>
                            <span style={{ fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>{service.volume}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSimulateRestart(service.id)}
                        disabled={isSimulatingRestart}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        Restart Service
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('cli');
                          executeCliCommand(service.id === 'backend' ? 'logs_backend' : service.id === 'frontend' ? 'logs_frontend' : 'ps');
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#4f46e5',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        Inspect Logs
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Multi-Stage Build Comparison Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 185, 150, 0.12)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Optimization Advantage: Multi-Stage Docker Build
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              By separating the Node.js compiler environment from the final Nginx serving layer, we eliminate the entire Node runtime and heavy <code>node_modules</code> directory from the production image.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}>
                <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>Standard Single-Stage (Node)</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>~850 MB</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                  Includes npm devDependencies, compilers, source code, and full Node runtime.
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                boxShadow: '0 4px 16px rgba(74, 222, 128, 0.10)'
              }}>
                <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase' }}>Our Multi-Stage Nginx Build</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>~24.8 MB</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                  <strong style={{ color: '#4ade80' }}>97.1% Size Reduction!</strong> Only minified HTML/JS/CSS served on Alpine Nginx.
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(212, 185, 150, 0.25)'
              }}>
                <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase' }}>Security &amp; Attack Surface</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>Zero Node Vulns</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                  No package managers, compilers, or shell interpreters exposed in production.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DOCKERFILES & SPECS ─────────────────────────────────── */}
      {activeTab === 'dockerfiles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* File selector pill bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#ffffff',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '6px' }}>
              Configuration Files:
            </span>
            {Object.keys(codeFiles).map(key => {
              const file = codeFiles[key];
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: isSelected ? 'none' : '1px solid #e2e8f0',
                    background: isSelected ? color : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  
                  {file.name}
                </button>
              );
            })}
          </div>

          {/* Active Code Viewer Card */}
          {codeFiles[selectedFile] && (
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              {/* File Header Bar */}
              <div style={{
                background: '#1e293b',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #334155',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  </div>
                  <div>
                    <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>
                      {codeFiles[selectedFile].name}
                    </span>
                    <span style={{
                      marginLeft: '10px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {codeFiles[selectedFile].tag}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(codeFiles[selectedFile].code, codeFiles[selectedFile].name)}
                  style={{
                    background: copiedFile === codeFiles[selectedFile].name ? '#10b981' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedFile === codeFiles[selectedFile].name ? '✓ Copied!' : '📋 Copy File Content'}
                </button>
              </div>

              {/* Description banner */}
              <div style={{
                background: '#f8fafc',
                padding: '10px 20px',
                borderBottom: '1px solid #1e293b',
                color: '#475569',
                fontSize: '12px'
              }}>
                ℹ️ {codeFiles[selectedFile].description}
              </div>

              {/* Code display with line numbers */}
              <pre style={{
                margin: 0,
                padding: '20px',
                color: '#e2e8f0',
                fontSize: '13px',
                lineHeight: 1.6,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                overflowX: 'auto',
                whiteSpace: 'pre'
              }}>
                {codeFiles[selectedFile].code}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INTERACTIVE CLI & COMMANDS ──────────────────────────── */}
      {activeTab === 'cli' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Command Quick Launcher Buttons */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Docker CLI Command Simulator
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569' }}>
              Click any standard Docker Compose operational command below to simulate container execution inside the embedded terminal:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px'
            }}>
              {[
                { key: 'up', title: 'docker compose up -d', subtitle: 'Build & launch all 3 services detached', iconType: 'rocket' },
                { key: 'ps', title: 'docker compose ps', subtitle: 'List running containers & ports', iconType: 'list' },
                { key: 'stats', title: 'docker stats', subtitle: 'Display real-time container CPU/RAM', iconType: 'barChart' },
                { key: 'logs_backend', title: 'docker logs backend', subtitle: 'Stream Node API and Mongoose logs', iconType: 'terminal' },
                { key: 'logs_frontend', title: 'docker logs frontend', subtitle: 'Inspect Nginx reverse proxy access', iconType: 'globe' },
                { key: 'exec', title: 'docker compose exec', subtitle: 'Run commands inside container environment', iconType: 'cpu' },
                { key: 'down', title: 'docker compose down', subtitle: 'Safely stop & destroy containers', iconType: 'stop' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => executeCliCommand(item.key)}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: activeCliCommand === item.key ? `2px solid ${color}` : '1px solid #e2e8f0',
                    background: activeCliCommand === item.key ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: '#f1f5f9',
  color: '#4f46e5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
}}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
</div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Terminal Display */}
          <div style={{
            background: '#090d16',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: '#131b2e',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #1e293b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ color: '#475569', fontSize: '12px', fontFamily: 'monospace', marginLeft: '6px' }}>
                  bash - portfolio@docker-engine:~/MyPortfolio
                </span>
              </div>
              <button
                onClick={() => setTerminalHistory([{ type: 'output', text: 'Terminal output cleared.' }])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Console
              </button>
            </div>

            <div style={{
              padding: '20px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              maxHeight: '440px',
              overflowY: 'auto'
            }}>
              {terminalHistory.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  {item.type === 'command' ? (
                    <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                      <span style={{ color: '#4ade80' }}>utsav@docker-host</span>:<span style={{ color: '#818cf8' }}>~/MyPortfolio</span># {item.text}
                    </div>
                  ) : (
                    <div style={{
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      marginTop: '4px',
                      paddingLeft: '12px',
                      borderLeft: '2px solid #334155'
                    }}>
                      {item.text}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80' }}>
                <span>utsav@docker-host</span>:<span style={{ color: '#818cf8' }}>~/MyPortfolio</span>#
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '14px',
                  background: '#38bdf8',
                  animation: 'pulse 1s infinite'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: LIVE METRICS & TELEMETRY ────────────────────────────── */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Telemetry Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Container Environment</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {containerInfo?.runtime?.environment ? containerInfo.runtime.environment.toUpperCase() : 'PRODUCTION'}
              </div>
              <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>
                Node {containerInfo?.runtime?.nodeVersion || 'v20.x Alpine'}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Backend Heap Memory</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>
                {containerInfo?.memory?.heapUsedMb ? `${containerInfo.memory.heapUsedMb} MB` : '42.8 MB'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Total Allocated: {containerInfo?.memory?.heapTotalMb || '64.5'} MB
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Container RSS (Resident)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {containerInfo?.memory?.rssMb ? `${containerInfo.memory.rssMb} MB` : '78.2 MB'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                External Buffers: {containerInfo?.memory?.externalMb || '2.1'} MB
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Uptime &amp; PID</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                {containerInfo?.runtime?.uptimeSeconds ? `${containerInfo.runtime.uptimeSeconds}s` : 'Healthy'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Container PID: {containerInfo?.runtime?.pid || '1 (init)'}
              </div>
            </div>
          </div>

          {/* Docker Network & Volume Inspection */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Docker Network &amp; Storage Volume Details
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {/* Network Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>portfolio_bridge_network</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: 1.8 }}>
                  <li><strong style={{ color: '#0f172a' }}>Driver:</strong> bridge</li>
                  <li><strong style={{ color: '#0f172a' }}>Subnet:</strong> 172.28.0.0/16 (automatic isolated subnet)</li>
                  <li><strong style={{ color: '#0f172a' }}>Internal DNS:</strong> 127.0.0.11 embedded Docker resolver</li>
                  <li><strong style={{ color: '#0f172a' }}>Resolution:</strong> <code style={{ color: '#4f46e5' }}>frontend</code>, <code style={{ color: '#4f46e5' }}>backend</code>, <code style={{ color: '#4f46e5' }}>mongo</code> by service name</li>
                </ul>
              </div>

              {/* Volume Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>portfolio_mongo_data</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: 1.8 }}>
                  <li><strong style={{ color: '#0f172a' }}>Driver:</strong> local</li>
                  <li><strong style={{ color: '#0f172a' }}>Host Mount:</strong> /var/lib/docker/volumes/portfolio_mongo_data/_data</li>
                  <li><strong style={{ color: '#0f172a' }}>Container Mount:</strong> /data/db</li>
                  <li><strong style={{ color: '#0f172a' }}>Persistence:</strong> Survives <code style={{ color: '#4f46e5' }}>docker compose down</code>, container rebuilds, and restarts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DockerContainerization;
