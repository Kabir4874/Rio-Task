# Rio Deep Live Multi-Vehicle GPS Tracking System

---

## Technical Stack & Libraries

### 1. Root Monorepo Orchestration

- **npm Workspaces**: Directs both `backend` and `frontend` packages.
- **Husky & lint-staged**: Runs automated format checking (`prettier`) and lint checks (`eslint`) on staged files prior to commits.
- **Concurrently**: Manages simultaneous multi-package watch execution.

### 2. Backend (NestJS Server)

- **NestJS & Express**: Structured API development with strict TypeScript compilation.
- **Prisma ORM & PostgreSQL**: Relational database mapping with Neon Serverless Postgres.
- **OpenAPI / Swagger**: Fully decorated controller endpoints for comprehensive API reference.
- **Rate Limiting & Security**: `@nestjs/throttler` (configured with proxy-trust header parsing), `helmet`, and `compression`.
- **Middlewares**: Custom global `HttpExceptionFilter` for standardized error formats, and `LoggingInterceptor` for HTTP audit trails.

### 3. Frontend (React Client)

- **Vite & React 19**: Modern bundler with React application logic.
- **Leaflet & OpenStreetMap**: Free, open-source mapping engine to plot active coordinates.
- **Tailwind CSS & Lucide Icons**: High-end styling layout with glassmorphism aesthetics.

---

## Project Structure

```
rio-task/
├── .husky/                  # Git hooks directory
├── backend/                 # NestJS server code
│   ├── src/
│   │   ├── common/          # Shared filters, interceptors, and types
│   │   ├── config/          # Environment variable validations
│   │   ├── drivers/         # Driver module (controllers, services, DTOs)
│   │   ├── vehicles/        # Vehicle module (controllers, services, DTOs)
│   │   ├── tracking/        # GPS tracking & Socket.io location gateway/simulator
│   │   └── map/             # Map feed query endpoints
│   ├── prisma/              # DB Schema (Postgres model definitions)
│   └── tsconfig.json        # Strict compiler settings
├── frontend/                # React client code
│   ├── src/
│   │   ├── components/      # Modular UI components (Layout, Map, Dashboards)
│   │   ├── hooks/           # Custom React hooks (logic & socket events encapsulation)
│   │   ├── pages/           # Page containers (UserDashboardPage, DriverControlPage)
│   │   ├── api.ts           # Type-safe API REST fallback client
│   │   ├── socket.ts        # Singleton Socket.io client instance
│   │   ├── types.ts         # Shared TypeScript interfaces
│   │   ├── utils.ts         # Simulated GPS route drift math
│   │   └── index.css        # Tailwind styles & custom Leaflet animations
│   └── tsconfig.app.json    # Strict bundler type checking
├── package.json             # Root monorepo workspace configuration
├── .prettierrc              # Central styling guidelines
└── README.md                # System documentation
```

---

## Setup & Running Instructions

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

### 1. Installation

Run `npm install` at the root directory to install dependencies across the monorepo workspace:

```bash
npm install
```

### 2. Environment Configurations

Verify environment files in both folders. The repository is pre-configured with a live Neon Cloud PostgreSQL database:

- **Backend Environment (`backend/.env` & `backend/.env.example`)**:

  ```env
  PORT=8001
  CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5174
  THROTTLE_TTL_MS=60000
  THROTTLE_LIMIT=120
  DATABASE_URL="postgresql://neondb_owner:npg_ABSlU1trxa4M@ep-damp-boat-at9g0xuh-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  ```

  _(Database schema migrations are already pushed and fully set up. To rebuild or view the DB Studio, use `npm run db:studio --prefix backend`)_.

- **Frontend Environment (`frontend/.env`)**:
  - Leave blank. It defaults to connecting with `http://localhost:8001/api`.

### 3. Running in Development Mode

To start both the backend NestJS server (on port 8001) and frontend Vite app (on port 5173) concurrently, run:

```bash
npm run dev
```

- **Frontend Client**: Access at `http://localhost:5173/`
- **Swagger API Documentation**: Access at `http://localhost:8001/api/docs`

### 4. Verification Check

To run tests, lint rules, formatting verification, and production compilation builds across all packages, run:

```bash
npm run verify
```

---

## System Architecture

### 1. Real-Time Socket.io Connection

Instead of resource-heavy HTTP polling intervals, the system implements a persistent event-driven communication channel via **Socket.io**:

- **WebSocket Gateway**: A real-time `TrackingGateway` handles socket handshakes and filters traffic strictly via the `'websocket'` transport to eliminate CORS issues and long-polling overhead.
- **Instant Feeds**: Toggling tracking state or emitting coordinates pushes data immediately to all active dashboard sessions, updating leaflet markers in under 50ms.

### 2. User Interface (Map Feed Dashboard)

The User View allows visitors to inspect live movements across Dhaka:

- **Interactive Live Map**: Centers in Dhaka and lists markers representing active tracking vehicles.
- **Side-Panel Listings**: Displays active vehicles with their corresponding type (Car, Motorcycle, CNG, Rickshaw, Delivery, Other), details, and the linked driver's name.
- **Fly-To Camera Control**: Clicking a vehicle card in the panel pans/zooms the camera smoothly onto its coordinates and triggers its detail popup.
- **Category Filtering**: A quick dropdown filters the map feed by vehicle category.
- **Passive WS Sync**: Replaced the interval REST queries; the client now passively listens to `'activeVehicles'` socket events to trigger state updates.

### 3. Driver Interface (Control Panel)

The Driver View allows individual operators to manage their profile and broadcast live GPS coordinates:

- **Session Persistence**: Entering a name creates a local profile (driver account) in the DB which is saved to `localStorage` to persist across reloads.
- **Workspace Management**: Drivers can add a vehicle type and description, and update vehicle specifications at any time.
- **Live GPS Simulator**:
  - Toggling "Start Live Tracking" updates tracking status.
  - Starts a client-side tracking loop that simulates route drift starting from coordinates near the Rio Deep Technologies Office in Moghbazar (`23.748, 90.403`).
  - Coordinates increment with minor random walk offsets every 3 seconds and emit updates via the socket `'updateLocation'` event.
  - Toggling tracking off clears the simulator loop and sends a status update.

### 4. Vehicle & Driver Association

The database schema models a strict `1-to-Many` relationship between Drivers and Vehicles (`driverId` foreign key on the `Vehicle` table). The application maintains and showcases this association:

- When adding a vehicle as a driver, it is tied exclusively to that driver's session uuid.
- When active, the User Map resolves the relational driver entity, printing the driver's name directly in the vehicle card and Leaflet marker popups.

### 5. Live GPS Simulation Details

Because the prototype doesn't require real GPS hardware, coordinate simulation is modeled locally:

1. **Start Coordinate Allocation**: When a driver turns on tracking, the system checks if the vehicle has a saved location. If not, it assigns default offsets near Moghbazar, Dhaka, based on the vehicle type (e.g. motorcycles start in a different sector than trucks to avoid overlaps).
2. **Drift Math**: Every 3 seconds, the tracking loop adds a floating increment representing standard speeds:
   $$\Delta \text{lat} \sim U(-0.0000735, 0.0000765), \quad \Delta \text{lng} \sim U(-0.0000750, 0.0000750)$$
   This drifts the vehicle dynamically along adjacent paths.

---

## Prototype Limitations

- **Active tab requirement**: Because the tracking simulation loop runs on the driver's client browser tab via `setInterval`, the tab must remain open and active in order to continue posting location logs. In a full production system, real GPS hardware trackers or native background services would report coordinates directly to the API independently of web sockets or client browser lifecycles.
- **Single Vehicle Lock**: Currently, each driver is mapped to their first registered vehicle to simulate standard fleet workspace behavior.
