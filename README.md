# CyberForge WebShield

A simplified cybersecurity web application built with Next.js that provides real-time threat detection and monitoring. This streamlined version focuses on core security features without unnecessary complexity.

## Features

- **Real-time Threat Scanning**: Scan payloads for XSS, SQL injection, and other security threats
- **Rule-based Detection**: Regex patterns for common attack vectors
- **Configurable Sensitivity**: Three levels - Low, Medium, and Paranoid
- **Safe Mode**: Option to log threats without blocking them
- **Live Dashboard**: Real-time monitoring interface
- **Rate Limiting**: Built-in protection against API abuse
- **DDoS Testing**: Built-in testing tools for rate limiting
- **Persistent Logging**: JSON-based log storage

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: Simple JSON file storage
- **Charts**: Chart.js with react-chartjs-2
- **Rate Limiting**: Custom implementation

## Project Structure

```
├── app/
│   ├── api/           # Next.js API routes
│   │   ├── config/    # Configuration management
│   │   ├── health/    # Health check endpoint
│   │   ├── logs/      # Log retrieval
│   │   ├── scan/      # Threat scanning
│   │   ├── rate-limiting/ # Rate limiting controls
│   │   └── rate-limit-stats/ # Rate limiting stats
│   ├── ddos-test/     # DDoS testing page
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main dashboard
├── components/        # React components
├── lib/              # Utility libraries
│   ├── config.ts     # Configuration management
│   ├── database.ts   # JSON file operations
│   ├── rate-limiter.ts # Rate limiting utilities
│   ├── rules.ts      # Security rule scanning
│   ├── api.ts        # API client functions
│   └── types.ts      # TypeScript types
├── data/             # JSON log storage
└── styles/           # CSS styles
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

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
- `GET /api/rate-limiting` - Get rate limiting status
- `POST /api/rate-limiting` - Toggle rate limiting

## Rate Limits

- Health check: 100 requests/minute
- Configuration (GET): 30 requests/minute
- Configuration (POST): 10 requests/minute
- Logs: 50 requests/minute
- Scan: 10 requests/minute

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

## DDoS Testing

The application includes a built-in DDoS testing feature at `/ddos-test` that allows you to:

- Test rate limiting effectiveness
- Simulate attack scenarios
- Monitor system response to high request volumes
- Toggle rate limiting on/off for testing

## Data Storage

The application uses simple JSON file storage at `data/logs.json` for persistence. This keeps the project simple while maintaining functionality.

## Security

This project is strictly defensive. No offensive tooling is included.
