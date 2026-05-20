# 🌡️ Hiliriset Ecoprint — IoT Environmental Monitor

Real-time temperature and humidity monitoring system for closed spaces.
An ESP microcontroller publishes sensor data over MQTT, ingested by a 
Go/Fiber backend, stored in PostgreSQL, and visualized in a React dashboard.

**Example:** [![Watch the video](https://github.com/fakhri-rasyad/ecoprint_golang_containerization/raw/0d76deb1fce3239e3fb261184c242f01978b008e/example_thumbnail.png)](https://github.com/fakhri-rasyad/ecoprint_golang_containerization/raw/0d76deb1fce3239e3fb261184c242f01978b008e/example.mp4) 
**Stack:** Go · Fiber · React · ECharts · PostgreSQL · MQTT · Docker

# Ecoprint — Docker Deployment Guide

Full stack deployment for the Hiliriset Ecoprint monitoring system using Docker Compose.

## Stack Overview

| Service | Description | Port |
| --- | --- | --- |
| `frontend` | React dashboard served by Nginx | `80` |
| `app` | Go + Fiber REST API + WebSocket | `3000` (internal) |
| `postgres` | PostgreSQL 16 database | `5432` |
| `mosquitto` | Eclipse Mosquitto MQTT broker | `1883` |
| `migrate` | Runs DB migrations on startup | — |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git

Verify Docker is running:
```bash
docker --version
docker compose version
```

---

## Folder Structure

```
project-root/
├── golang_backend/            # Go backend source + Dockerfile
│   ├── .env                   # Backend environment variables
│   └── database/
│       └── migrations/        # SQL migration files
├── ecoprint-frontend/         # React frontend source + Dockerfile
│   └── nginx.conf             # Nginx config
├── mosquitto/
│   └── config/
│       └── mosquitto.conf     # Mosquitto broker config
├── postgres/
│   └── data/                  # PostgreSQL persistent data (auto-created)
└── compose.yaml               # Docker Compose config
```

---

## Setup

### 1 — Clone the repository

```bash
git clone <repo-url>
cd project-root
```

### 2 — Create the backend environment file

Create `golang_backend/.env`:

```env
# App
APP_PORT=3000
JWT_SECRET=jwt_secret_password

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=db_password
DB_NAME=ecoprint_golang

# MQTT
MQTT_HOST=mosquitto
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# CORS — must match the host you access the frontend from
CORS_ORIGIN=http://localhost
```

> **Important:** Change `JWT_SECRET` and `DB_PASSWORD` to strong values before deploying.

### 3 — Build and start all services

```bash
docker compose up --build
```

First run will:
1. Pull base images (requires internet)
2. Build the Go backend image
3. Build the React frontend image
4. Start PostgreSQL and wait until healthy
5. Run database migrations
6. Start Mosquitto MQTT broker
7. Start the backend and frontend

### 4 — Open the app

Once all services are running, open:

```
http://localhost
```

Register a new account and start monitoring.

---

## Common Commands

### Start (after first build)
```bash
docker compose up
```

### Start in background
```bash
docker compose up -d
```

### Stop all services
```bash
docker compose down
```

### Rebuild and restart everything
```bash
docker compose down
docker compose up --build
```

### Rebuild a single service
```bash
docker compose up --build frontend
docker compose up --build app
```

---

## Viewing Logs

All services:
```bash
docker compose logs -f
```

Specific service:
```bash
docker compose logs -f frontend
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f mosquitto
```

---

## Updating the Application

### Pull latest code and redeploy
```bash
git pull
docker compose down
docker compose up --build
```

### Update only the frontend
```bash
git pull
docker compose up --build frontend
```

### Update only the backend
```bash
git pull
docker compose up --build app
```

---

## Data Persistence

PostgreSQL data is stored in `./postgres/data/` on the host machine. This folder persists across container restarts and rebuilds.

To reset the database (warning — deletes all data):
```bash
docker compose down -v
rm -rf ./postgres/data
docker compose up --build
```

---

## ESP Device Setup

ESP devices communicate with the backend via MQTT on port `1883`. Make sure:

- Port `1883` is accessible on the host machine from the ESP devices
- The ESP is configured to connect to the host machine's IP address
- Mosquitto config at `mosquitto/config/mosquitto.conf` allows the connection

---

## Troubleshooting

**Docker Desktop not running**
```
error during connect: open //./pipe/dockerDesktopLinuxEngine
```
Open Docker Desktop and wait for the engine to fully start before running `docker compose up`.

---

**Frontend shows blank page or 500 error**

Check Nginx logs:
```bash
docker compose logs -f frontend
```
Rebuild the frontend image:
```bash
docker compose up --build frontend
```

---

**Backend cannot connect to database**

Check that `DB_HOST=postgres` in `golang_backend/.env` — not `localhost`. Inside Docker, services communicate by their service name.

Check backend logs:
```bash
docker compose logs -f app
```

---

**Migration failed**

Check migration logs:
```bash
docker compose logs migrate
```
Verify `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` in `.env` match the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values.

---

**MQTT devices not connecting**

- Verify port `1883` is not blocked by a firewall
- Check Mosquitto logs: `docker compose logs -f mosquitto`
- Verify `mosquitto/config/mosquitto.conf` allows connections from your network

---

**CORS errors in browser**

Make sure `CORS_ORIGIN` in `golang_backend/.env` matches exactly the URL you use to access the frontend. For example:
- Accessing via `http://localhost` → `CORS_ORIGIN=http://localhost`
- Accessing via `http://192.168.1.10` → `CORS_ORIGIN=http://192.168.1.10`

After changing `.env`, restart the backend:
```bash
docker compose up --build app
```

---

**WebSocket not connecting on live session page**

Nginx proxies WebSocket connections via `/api/v1/sessions/:id/ws`. Check that the `Upgrade` and `Connection` headers are present in `nginx.conf`:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## License

MIT