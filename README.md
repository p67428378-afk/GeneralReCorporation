# GeneralReCorporation

## Frontend (client/)

### Prerequisites
- Node.js 18+ and npm 8+

### Setup

1. Install dependencies:
```bash
cd client
npm install
cd ..
```

### Available Commands

**Development Server:**
```bash
cd client
npm run dev
cd ..
```
Opens the app at `http://localhost:5173`

**Production Build:**
```bash
cd client
npm run build
cd ..
```
Creates optimized build in `client/dist/`

**Run Tests:**
```bash
cd client
npm test
cd ..
```

**Build & Preview:**
```bash
cd client
npm run preview
cd ..
```
Preview production build locally

### Environment Variables

The frontend comes with a pre-configured `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

The frontend connects to the backend API at this URL. For production deployment, set `VITE_API_BASE_URL` to the deployed backend URL via `--build-arg` in Docker or via your CI/CD environment.

### Running with the Backend

The frontend requires the backend server to be running. See the **Full-Stack Local Development** section in this README for complete setup instructions.
