# Endpoint Health Monitoring

A full-stack application that monitors the health of distributed machines/servers. It uses a **Push Model**, where machines send periodic heartbeats to the server, and the dashboard displays which machines are healthy vs. offline in real-time.

## The Stack

- **Frontend:** Next.js (React), Tailwind CSS 
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Language:** TypeScript across the entire stack
- **Testing:** Vitest

### Why this stack?
1. **TypeScript Everywhere:** Sharing types (like `Machine` and `MachinesResponse`) between the frontend and backend eliminates a whole class of bug and makes refactoring safe and fast.
2. **Next.js & Tailwind:** Next.js gives a highly optimized, fast-loading React environment out of the box, while Tailwind allows for rapid, consistent styling without managing separate CSS files.
3. **Express.js:** A lightweight, unopinionated backend framework that makes it easy to set up RESTful endpoints (like the heartbeat receiver).
4. **Prisma & PostgreSQL:** PostgreSQL provides robust, persistent relational storage. Prisma makes interacting with the database type-safe and incredibly intuitive compared to raw SQL or older ORMs.

## How It Works (Hybrid Architecture)

This system uses a smart **Hybrid Model** to monitor machines:

1. **Push Model (Default):** The backend acts as a receiver. Client machines are expected to send a `POST` request to `/api/v1/heartbeats` with their `machineName`. 
2. **Pull Model (Active Pinger):** If a machine is registered with a name that starts with `http://` or `https://`, the backend automatically detects it and actively pings that URL every 10 seconds. 

In both cases, if the backend hasn't seen a heartbeat (or a successful ping) for a machine in the last **30 seconds**, it assumes the machine has gone offline. The frontend polls the backend every **10 seconds** to fetch the latest statuses.

## How to Run It Locally

You will need Node.js (v18+) and Docker (or a local PostgreSQL instance).

### 1. Database Setup
Ensure you have a PostgreSQL database running. You can easily start one using Docker:
```bash
docker run --name skenzer-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=signal -p 5432:5432 -d postgres
```

### 2. Backend Setup
```bash
cd backend
npm install

# Set up the environment
echo "DATABASE_URL=postgresql://postgres:YOUR_PASS@localhost:5432/signal?schema=public" > .env
echo "PORT=4000" >> .env

# Push the schema to the database
npx prisma db push

# (Optional) Seed the database with some mock data
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Set up the environment
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start the frontend development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Testing
The backend includes pure unit tests for the core business logic (e.g., the offline calculation, error handling).
```bash
cd backend
npm test
```

## Trade-offs & Future Improvements

1. **Hybrid Push/Pull:** I implemented a hybrid architecture because a pure Pull model (actively pinging everything) doesn't scale well. If we had 10,000 machines, a pure Pull model would require the backend to manage 10,000 outgoing HTTP requests constantly, risking timeouts. By relying on a Push model for standard machines, the load is distributed, while the Pull model is reserved only as a convenience for registered URLs.
2. **Polling vs. WebSockets:** Currently, the frontend polls the backend every 10 seconds. This is simple and stateless, making it robust against network drops. However, for true real-time updates without wasting bandwidth on unchanged data, a WebSocket connection or Server-Sent Events (SSE) would be better.
3. **Authentication:** For the scope of this assignment, the `/api/v1/heartbeats` endpoint is open. In a production system, machines would need to provide an API key or JWT to prove their identity before recording a heartbeat.
4. **Database Polling:** The `/api/v1/machines` endpoint queries the PostgreSQL database directly. Under heavy load, this could bottleneck. We could introduce a Redis caching layer to serve the list of machines instantly from memory.
