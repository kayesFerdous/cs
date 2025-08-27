# CyberForge WebShield - Next.js Edition

A unified web application built with Next.js that provides real-time cybersecurity threat detection and monitoring. This application combines both frontend and backend functionality in a single Next.js project.

## Features

- **Real-time Threat Scanning**: Scan payloads for XSS, SQL injection, and other security threats
- **Rule-based Detection**: Multiple regex patterns for common attack vectors
- **Configurable Sensitivity**: Three levels - Low, Medium, and Paranoid
- **Safe Mode**: Option to log threats without blocking them
- **Live Dashboard**: Real-time updates via WebSocket connections
- **Rate Limiting**: Built-in protection against API abuse
- **Persistent Logging**: SQLite database for threat logs

## Project Structure

```
frontend/
├── app/
│   ├── api/           # Next.js API routes (replaces FastAPI backend)
│   │   ├── config/    # Configuration management
│   │   ├── health/    # Health check endpoint
│   │   ├── logs/      # Log retrieval
│   │   ├── scan/      # Threat scanning
│   │   └── rate-limit-stats/
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main dashboard
├── components/        # React components
├── lib/              # Utility libraries
│   ├── config.ts     # Configuration management
│   ├── database.ts   # SQLite database operations
│   ├── rate-limiter.ts # Rate limiting utilities
│   ├── rules.ts      # Security rule scanning
│   ├── ml-model.ts   # ML model (stub)
│   └── types.ts      # TypeScript types
├── data/             # SQLite database storage
├── server.js         # Custom server with WebSocket support
└── package.json
```

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Real-time**: WebSocket connections
- **Charts**: Chart.js with react-chartjs-2
- **Rate Limiting**: Custom implementation

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install the required dependencies:
   ```bash
   npm install better-sqlite3 ws
   npm install --save-dev @types/better-sqlite3 @types/ws
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## API Endpoints

### Configuration

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration

### Scanning

- `POST /api/scan` - Scan a payload for threats

### Logs

- `GET /api/logs?limit=200` - Retrieve threat logs

### Monitoring

- `GET /api/health` - Health check
- `GET /api/rate-limit-stats` - Rate limiting information

### WebSocket

- `ws://localhost:3000/api/ws/logs` - Real-time log updates

## Rate Limits

- Health check: 100 requests/minute
- Configuration (GET): 30 requests/minute
- Configuration (POST): 10 requests/minute
- Logs: 50 requests/minute
- Scan: 20 requests/minute

## Database

The application uses SQLite for persistent storage. The database file is automatically created at `data/webshield.db` with the following schema:

```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  payload TEXT NOT NULL,
  classification TEXT NOT NULL,
  rule_hits TEXT NOT NULL,
  ml_score REAL,
  sensitivity TEXT NOT NULL,
  safe_mode INTEGER NOT NULL
);
```

## Security Features

### Rule-based Detection

- XSS patterns (script tags, event handlers, javascript: URLs)
- SQL injection patterns (UNION SELECT, DROP TABLE, OR 1=1)
- Command injection patterns
- Path traversal attempts
- Generic dangerous patterns (iframe, svg, curl, wget)

### Threat Classification

- **Clean**: No threats detected
- **Suspicious**: Some threats detected based on sensitivity
- **High Threat**: Severe threats that require immediate attention

### Sensitivity Levels

- **Low**: Only escalates obvious threats
- **Medium**: Balanced detection (default)
- **Paranoid**: Aggressive detection of potential threats

## Migration from FastAPI

This version replaces the original FastAPI backend with Next.js API routes while maintaining the same functionality:

- ✅ All API endpoints migrated
- ✅ Rate limiting implemented
- ✅ Database operations converted to better-sqlite3
- ✅ WebSocket support for real-time updates
- ✅ Same security scanning logic
- ✅ Configuration management
- ✅ Frontend components unchanged

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
