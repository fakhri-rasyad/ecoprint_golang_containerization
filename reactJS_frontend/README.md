# Ecoprint Frontend — Deployment Branch

This branch is configured for production deployment via Docker + Nginx.

For development setup, see the `main` branch README.

---

## Quick Start

1. Make sure you are in the project root (where `compose.yaml` is):
   ```bash
   cd project-root
   ```

2. Set up the backend environment file at `golang_backend/.env`:
   ```
   APP_PORT=3000
   JWT_SECRET=your_jwt_secret

   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=ecoprint_golang

   MQTT_HOST=mosquitto
   MQTT_PORT=1883
   MQTT_USERNAME=
   MQTT_PASSWORD=

   CORS_ORIGIN=http://localhost
   ```

3. Build and start all services:
   ```bash
   docker compose up --build
   ```

4. Open `http://localhost` in your browser.

---

## Services

| Service | Description | Port |
| --- | --- | --- |
| `frontend` | React app served by Nginx | 80 |
| `app` | Go + Fiber backend | 3000 (internal) |
| `postgres` | PostgreSQL 16 database | 5432 |
| `mosquitto` | MQTT broker | 1883 |
| `migrate` | Runs DB migrations on startup | — |

The frontend is the only service exposed to the browser. Nginx proxies `/api/` and `/v1/` requests to the backend internally.

---

## Ports Exposed to Host

| Port | Service |
| --- | --- |
| `80` | Frontend (Nginx) |
| `5432` | PostgreSQL (optional, can be removed in production) |
| `1883` | Mosquitto MQTT broker |

---

## Updating the Application

To redeploy after code changes:

```bash
docker compose down
docker compose up --build
```

To redeploy only the frontend:

```bash
docker compose up --build frontend
```

To redeploy only the backend:

```bash
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
```

---

## Stopping the Application

```bash
docker compose down
```

To also remove the database volume (warning — deletes all data):
```bash
docker compose down -v
```

---

## Folder Structure

```
project-root/
├── golang_backend/        # Go backend source + Dockerfile
│   ├── .env               # Backend environment variables
│   └── database/
│       └── migrations/    # SQL migration files
├── ecoprint-frontend/     # React frontend source + Dockerfile
│   ├── nginx.conf         # Nginx config for serving + proxying
│   └── .env.production    # Frontend production env (VITE_API_URL=)
├── mosquitto/
│   └── config/
│       └── mosquitto.conf # Mosquitto broker config
├── postgres/
│   └── data/              # PostgreSQL persistent data volume
└── compose.yaml           # Docker Compose config
```

---

## Troubleshooting

**Frontend shows blank page**
- Check Nginx logs: `docker compose logs -f frontend`
- Make sure `npm run build` completed successfully during the Docker build

**Cannot connect to backend**
- Check backend logs: `docker compose logs -f app`
- Verify `golang_backend/.env` has correct values
- Make sure `CORS_ORIGIN` matches the host you're accessing from

**Database migration failed**
- Check migration logs: `docker compose logs migrate`
- Verify `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` match in `.env`

**WebSocket not connecting**
- Nginx is configured to proxy WebSocket upgrades via `/api/v1/sessions/:id/ws`
- Check that `Upgrade` and `Connection` headers are being forwarded correctly in `nginx.conf`

**MQTT devices not connecting**
- Verify Mosquitto config at `mosquitto/config/mosquitto.conf`
- Make sure port 1883 is accessible from your ESP devices on the local network

---

## License

MIT