# Rio GPS

Live multi-vehicle GPS tracking assessment project for Rio Deep Technologies.

The app is a web-based prototype with two interfaces:

- **Users** can view active vehicles on a live map, filter by vehicle type, inspect vehicle details, and see which driver owns each vehicle.
- **Drivers** can register/login, add vehicles, edit vehicle details, and start or stop simulated live tracking for one selected vehicle.

## Quick Run

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run prisma:generate --prefix backend
npm run db:push --prefix backend
npm run dev
```

Before running `db:push`, fill `backend/.env` with your database URL and JWT secret.

Open:

- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8001/api/docs`

Build check:

```bash
npm run build
```

## Tech Stack

**Monorepo**

- npm workspaces
- Shared root scripts for install, development, build, lint, format, and tests

**Frontend**

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap
- Socket.io client
- TanStack Query
- Zustand
- Zod

**Backend**

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.io gateway
- JWT authentication
- bcrypt password hashing
- Zod validation
- Swagger
- Helmet, compression, CORS, throttling

## Monorepo Architecture

```txt
rio-task/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── auth/          # register/login, JWT strategy, auth guard
│       ├── common/        # filters, interceptors, pipes, vehicle type helpers
│       ├── config/        # environment validation
│       ├── drivers/       # driver read APIs
│       ├── map/           # active vehicle map feed
│       ├── prisma/        # Prisma service
│       ├── tracking/      # tracking status, location updates, websocket gateway
│       └── vehicles/      # add/update/list driver vehicles
├── frontend/
│   └── src/
│       ├── api/           # REST client
│       ├── components/    # layout, driver controls, user dashboard, maps
│       ├── hooks/         # user dashboard, driver session, tracking logic
│       ├── lib/           # socket client
│       ├── pages/         # route-level pages
│       ├── store/         # Zustand stores
│       ├── types/         # shared frontend interfaces
│       └── utils/         # validation and GPS simulation helpers
├── package.json           # workspace scripts
└── README.md
```

The frontend and backend are separate workspace packages. The root package runs both together during development and builds them separately for production.

## Features

### User Interface

- Live map powered by Leaflet and OpenStreetMap
- Active vehicle list
- Vehicle type filtering
- Search by driver or vehicle details
- Different marker icons/colors for Car, Motorcycle, Rickshaw, CNG, Delivery, and Other
- Vehicle popups with type, driver, details, and coordinates
- Fly-to-map behavior when selecting a vehicle
- Optional user location button with last-known-location reuse

### Driver Interface

- Driver registration and login
- JWT-backed session stored client-side
- Add multiple vehicles under one driver account
- Edit vehicle details in a modal
- Start/stop simulated tracking
- One active tracking vehicle per driver at a time
- Live coordinate simulation every 3 seconds while tracking is active
- Driver map with current simulated location and path trail

### Vehicle and Driver Relationship

Each vehicle belongs to exactly one driver through the database relationship:

- `Driver` has many `Vehicle`
- `Vehicle` belongs to one `Driver`
- `Location` belongs to one `Vehicle` and one `Driver`

The user dashboard shows the driver name with each active vehicle, so the relationship is visible in the UI.

## Real-Time Socket Flow

Socket.io is used for live map updates.

1. A user opens the dashboard.
2. The socket connects and receives the current active vehicles.
3. A driver starts/stops tracking or sends a location update.
4. The backend updates the database.
5. The backend emits the latest active vehicle list to all connected clients.
6. The user dashboard updates the TanStack Query cache directly from the socket event.

The app still has REST endpoints as the source of truth and fallback path. Socket updates are used to avoid polling and keep the map responsive.

Driver socket actions are authenticated. Public dashboard sockets may listen to active vehicles, but driver update events require a valid token.

## Caching Strategy

The frontend uses TanStack Query for server-state caching.

- Active vehicles are cached by query key.
- Driver vehicles are cached by driver id.
- Both use a short stale window because sockets push fresh data.
- Socket `activeVehicles` events write directly into the query cache.
- Manual refresh still calls the REST endpoint.
- Local UI state such as selected vehicle, filters, path history, and driver session is kept in Zustand/localStorage.

This keeps REST usage low while preserving a simple recovery path if a socket event is missed.

## Tracking Simulation

The prototype does not require real GPS hardware.

When a driver starts tracking:

- The backend marks the selected vehicle as active.
- Other active vehicles for the same driver are turned off.
- The frontend chooses a default start coordinate near Moghbazar, Dhaka if no coordinate exists.
- Every 3 seconds, the frontend generates a small coordinate drift.
- The coordinate is sent through Socket.io when connected, or through REST fallback.
- The backend stores the latest location and broadcasts the active vehicle list.

## Security Notes

Security is handled in the backend and at API boundaries:

- Passwords are hashed with bcrypt.
- JWT is used for driver authentication.
- Protected REST routes use a JWT guard.
- Driver update operations check vehicle ownership.
- Socket update events verify JWT before accepting tracking or location changes.
- DTOs are validated with Zod pipes.
- Vehicle types are normalized and restricted to known values.
- CORS is configured from environment.
- Helmet adds common HTTP security headers.
- Global throttling limits excessive requests.
- A global exception filter standardizes API errors.
- Prisma queries are parameterized through the ORM.
- Secrets are not documented in the README; use `.env.example` files as templates.

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Files

Copy the example files and fill in your local values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The actual values are intentionally not written in this README. Keep secrets in local `.env` files only.

### 3. Prepare Database

```bash
npm run prisma:generate --prefix backend
npm run db:push --prefix backend
```

### 4. Run Development Servers

```bash
npm run dev
```

Then open:

- Frontend app: `http://localhost:5173`
- API docs: `http://localhost:8001/api/docs`

## Scripts

Run from the repository root:

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run test
npm run verify
```

Backend-only:

```bash
npm run start:dev --prefix backend
npm run build --prefix backend
npm run test --prefix backend
npm run db:push --prefix backend
npm run db:studio --prefix backend
```

Frontend-only:

```bash
npm run dev --prefix frontend
npm run build --prefix frontend
npm run lint:check --prefix frontend
```

## API Overview

Swagger documentation is available at the backend `/api/docs` route during development.

Main API areas:

- Health check
- Driver auth
- Driver listing
- Vehicle add/update/list
- Tracking status update
- Location update
- Active vehicle map feed

## Prototype Limitations

- Simulated tracking runs from the driver browser tab. If the tab closes, simulated movement stops.
- One driver may register many vehicles, but only one vehicle can be actively tracked at a time in this prototype.
- The user location marker depends on browser/OS geolocation availability.
- This project is optimized for assessment/demo clarity, not production fleet hardware integration.

## Requirement Coverage

- Web-based platform: yes
- Separate User and Driver interfaces: yes
- Register/login driver: yes
- Add vehicle details: yes
- Select vehicle type: yes
- Update vehicle information: yes
- View own registered vehicles: yes
- Start/stop simulated tracking: yes
- Live/simulated vehicle map: yes
- Different vehicle types: yes
- Driver-vehicle relationship visible: yes
- Local setup documentation: yes
- Tools and technologies documented: yes
- Limitations documented: yes

## Submission

Submit the full repository through GitHub. If hosted, include the live demo URL in the repository description or submission message.
