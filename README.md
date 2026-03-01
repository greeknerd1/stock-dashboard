# Stock Dashboard

## Run locally (HTTP)

```bash
cd backend && npm start
cd frontend && npm start
```

## Run locally with HTTPS

### 1) Create local certificates

Create certificates for `localhost` (example with OpenSSL):

```bash
mkdir -p backend/certs frontend/certs
openssl req -x509 -newkey rsa:2048 -sha256 -nodes \
  -keyout backend/certs/server.key \
  -out backend/certs/server.crt \
  -days 365 \
  -subj "/CN=localhost"

cp backend/certs/server.key frontend/certs/server.key
cp backend/certs/server.crt frontend/certs/server.crt
```

### 2) Configure backend

Copy `backend/env.sample` to `backend/.env`, then set DB and API key values.

For HTTPS, set:

```dotenv
ENABLE_HTTPS=true
SSL_KEY_PATH=certs/server.key
SSL_CERT_PATH=certs/server.crt
PORT=5001
```

Start backend:

```bash
cd backend
npm run start:https
```

### 3) Configure frontend

Copy `frontend/env.sample` to `frontend/.env` and set:

```dotenv
REACT_APP_API_BASE_URL=https://localhost:5001
HTTPS=true
SSL_CRT_FILE=certs/server.crt
SSL_KEY_FILE=certs/server.key
```

Start frontend:

```bash
cd frontend
npm run start:https
```

The app will run at `https://localhost:3000` and call the backend over HTTPS.
