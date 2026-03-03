# FuelEU Maritime Compliance Platform

A complete, end-to-end platform for monitoring, managing, and optimizing compliance with the European Union's FuelEU Maritime regulation. This system handles vessel reporting, greenhouse gas (GHG) intensity calculations, compliance balance tracking, and the application of financial pooling and banking mechanisms.

## 1. Project Overview

The **FuelEU Maritime regulation** mandates a gradual reduction in the GHG intensity of energy used on board ships calling at European ports. Ships that fail to meet their intensity targets face stringent financial penalties, while ships that overachieve generate a positive "Compliance Balance" (CB). 

This platform exists to help ship owners, operators, and compliance officers:
1. **Monitor** fleet and individual vessel GHG performance against regulatory baselines.
2. **Calculate** real-time Compliance Balances (CB) based on fuel consumption and distance.
3. **Manage** surplus CB strategically through Article 20 **Banking** (saving for next year) or Article 21 **Pooling** (sharing deficit/surplus with other ships).

## 2. Architecture

This application is built using a strict **Hexagonal Architecture (Ports and Adapters)** pattern. This architectural style ensures that the core application domain—the complex maritime compliance rules—remains completely isolated and decoupled from external concerns (like Express.js for HTTP, or Prisma for PostgreSQL). 

- **Domain Layer:** Contains pure TypeScript entities, value objects, domain services, and domain errors (e.g., calculating exactly how GHG limits are penalized). It has zero external dependencies.
- **Application Layer (Use Cases):** Orchestrates domain logic against abstract inbound/outbound ports (interfaces) for specific operations (e.g., "Join a Pool", "Calculate Adjusted CB").
- **Adapters (Infrastructure):** Implements the ports. Express controllers act as *primary* inbound adapters triggering the Use Cases. Prisma repositories act as *secondary* outbound adapters handling database persistence.

### Folder Structure Overview

```text
frontend/
├── src/
│   ├── components/      # Reusable React UI (Layout, Tables)
│   ├── pages/           # High-level route components (Dashboard, Pools, etc.)
│   ├── services/        # Axios API fetchers strongly typed to the domain
│   └── types/           # TS Interfaces bridging backend DTO expectations
│
backend/
├── src/
│   ├── core/            # 🔥 The isolated core application
│   │   ├── domain/      # Pure business logic (Entities, ValObjs, Calculators)
│   │   ├── application/ # Orchestration (Use Cases, DTOs, Zod Schemas)
│   │   └── ports/       # Interfaces (Inbound use cases, Outbound repositories)
│   │
│   ├── adapters/        # 🔌 External integrations
│   │   ├── inbound/     # Express.js (HTTP Controllers, Middlewares, Routes)
│   │   └── outbound/    # Prisma (DB Repositories)
│   │
│   └── infrastructure/  # Framework setup (Server init, DI Container, Logging)
```

### Request Flow
```mermaid
graph TD
    A[Frontend React Client] -->|JSON over HTTP| B(Express Route/Middleware)
    B -->|Zod Validated DTO| C(REST Controller)
    C -->|Invokes Interface| D{Application Use Case}
    D -->|Executes Business Rules| E[Core Domain Layer]
    D -->|Calls DB Interface| F[Prisma Repository Adapter]
    F <--> G[(PostgreSQL)]
```

## 3. Setup Instructions

### Prerequisites
- **Node.js**: v18 or later
- **PostgreSQL**: v14 or later (running locally or via Docker)
- **NPM** or **Yarn**

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/fueleu_db?schema=public"
   JWT_SECRET="your_super_secret_key"
   FRONTEND_URL="http://localhost:5173"
   LOG_LEVEL=info
   ```
4. Run database migrations and generate the Prisma Client:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure you have the environment variable configured in `frontend/.env`:
   ```env
   VITE_API_URL="http://localhost:3000/api/v1"
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```

## 4. API Documentation

All routes require a valid JWT token in the `Authorization: Bearer <token>` header, except for explicitly public endpoints (if configured).

### Routes (`/api/v1/routes`)
| Method | Endpoint | Auth | Description | Example Body / Query |
|---|---|---|---|---|
| `GET` | `/` | Yes | Get paginated routes for a ship | `?shipId=S1&year=2025` |
| `POST` | `/` | Yes | Create a new route leg | `{"shipId":"S1", "year":2025, "vesselType":"Container", ...}` |
| `GET` | `/:id` | Yes | Get route details | - |
| `DELETE` | `/:id` | Yes | Delete a route | - |
| `POST` | `/:routeId/baseline` | Yes | Mark a route as the analytical baseline | - |
| `GET` | `/comparison` | Yes | Compare actuals vs target/baseline | `?shipId=S1&year=2025` |

### Compliance (`/api/v1/compliance`)
| Method | Endpoint | Auth | Description | Example Body / Query |
|---|---|---|---|---|
| `GET` | `/cb` | Yes | Get static unadjusted Compliance Balance | `?shipId=S1&year=2025` |
| `GET` | `/adjusted-cb` | Yes | Get actual CB after banking/pooling | `?shipId=S1&year=2025` |

### Banking (`/api/v1/banking`)
| Method | Endpoint | Auth | Description | Example Body / Query |
|---|---|---|---|---|
| `POST` | `/bank` | Yes | Save surplus CB for next year | `{"shipId":"S1", "year":2025, "amount": 1000}` |
| `POST` | `/apply` | Yes | Apply previous year surplus to deficit | `{"shipId":"S1", "year":2025, "amount": 500}` |
| `GET` | `/ledger` | Yes | Fetch historical bank applications | `?shipId=S1` |

### Pools (`/api/v1/pools`)
| Method | Endpoint | Auth | Description | Example Body / Query |
|---|---|---|---|---|
| `POST` | `/` | Yes | Create a new compliance pool | `{"year":2025, "shipIds":["S1", "S2"]}` |
| `GET` | `/:poolId` | Yes | View pool members and CB offsets | - |
| `POST` | `/:poolId/join` | Yes | Add a ship to an existing pool | `{"shipId":"S3"}` |
| `POST` | `/:poolId/leave` | Yes | Remove a ship from a pool | `{"shipId":"S2"}` |

---

## 5. How Compliance Works

The FuelEU Maritime logic is deeply integrated into the `core/domain/` layer of the backend using Value Objects to ensure mathematical precision.

### 1. Compliance Balance (CB)
The baseline metric. It represents whether the ship used fuel that was "cleaner" (Surplus) or "dirtier" (Deficit) than the EU target.

**Formula Overview:**
`CB = Energy_in_Scope * (Target_GHG_Intensity - Actual_GHG_Intensity)`

If the actual GHG intent is exactly the target (e.g. 89.3 gCO2eq/MJ), CB is `0`. 
- **Positive CB:** The ship overachieved. It has surplus compliance to save or sell.
- **Negative CB:** The ship failed the target. It owes penalties unless mitigated.

### 2. Banking (Article 20)
If a ship generates a surplus (+CB), it can electronically bank that surplus to use in following years. 
- Example: 2024 CB is `+500,000`. We bank it. Inside the `bankingService`, it reduces the current unallocated surplus and generates a `SURPLUS` ledger entry. Next year, if the ship has a deficit of `-200,000`, the ship can call `ApplyBanked` to utilize it.

### 3. Pooling (Article 21)
Ships can form a pool to share their CB. Pool creation strictly enforces that the aggregate CB of all member ships combined must be `≥ 0` (The pool must be net compliant).
- The `CreatePool` and `JoinPool` domain use-cases lock the compliance rows using PostgreSQL `FOR UPDATE` to sum member CBs safely across transactions.

### 4. Adjusted CB
The `Adjusted CB` is the final calculation metric used on the Dashboard. It dynamically resolves:
`Adjusted CB = Static_CB + Applied_Banked_Surplus + Pool_Allocation_Offset`

## 6. Security Measures

This platform is hardened for production financial data:
1. **Hexagonal Immutability**: Business rules cannot be bypassed at the API layer because controllers have no access to the DB wrapper, passing pure data payloads instead.
2. **Resource-level Ownership Middleware (AuthZ)**: The `requireShipOwnership` middleware explicitly validates that the `req.user.shipIds` extracted from the JWT token intersect with the `shipId` being requested or mutated.
3. **Algorithm Hacking Prevention**: JWT validation restricts headers explicitly to `algorithms: ['HS256']`.
4. **Race Condition Prevention**: Financial mutations (applying banked credits, joining pools) are tightly wrapped in `Prisma.$transaction()` boundaries. Furthermore, `FOR UPDATE` database row-level locking prevents double-spend attacks when allocating surplus across concurrent API calls.
5. **CORS and Payload Guardrails**: Minimal Express config ensuring 1MB strict body limits and environmental CORS validation mapping exclusively to `VITE_API_URL`.
6. **Idempotency**: Sensitive state machine updates enforce Idempotency keys (`X-Idempotency-Key` header) to prevent double firing on network retries.

## 7. Project Structure Details

### Backend Code
The backend enforces Clean Architecture heavily:
- `/core/application/dto/`: Handles all HTTP input parsing via strict `Zod` schemas. Data entering the application layer is guaranteed structurally valid.
- `/core/application/use-cases/`: Application workflow orchestrators. They receive cleanly validated parameters, instantiate domain objects, push rules, and tell repositories to persist.
- `/core/domain/value-objects/`: Immutable strict types like `Year`, `Zero-emission-Target`. It guards against mathematically impossible calculations (e.g. Negative Fuel Consumption).
- `/infrastructure/di/container.ts`: A purely explicit Dependency Injection registry. Controllers request dependencies rather than importing concrete db files, enabling 100% mockable, fast unit tests.

### Frontend Code
- Built with `Vite` for lightning-fast HMR and minimal bundling.
- Heavily utilizes strict TypeScript generic interfaces corresponding exactly to the Backend DTO responses.
- Separates network side-effects completely using isolated `Axios` wrappers in `/services/`.
- Uses `TailwindCSS` directly mapping cleanly without bloated UI component libraries.

## 8. Design Decisions

- **Hexagonal Architecture (Clean Architecture)**: The maritime compliance calculations are exceptionally complex and will change as EU regulations shift in 2030, 2035, etc. If business logic was tied into Express `req/res` handlers, upgrades would be a nightmare. By isolating it, we can independently test math without booting an HTTP server.
- **Prisma ORM**: Guarantees type-safety all the way down to the Postgres columns, bridging seamlessly into our inbound/outbound Port layer interfaces.
- **Value Objects**: Ensuring `Amount` or `GHGIntensity` are instantiated explicitly prevents arithmetic errors where raw `numbers` meant for distance are multiplied against `numbers` meant for energy. 

## 9. Future Improvements

Given the MVP scope of this production skeleton, upcoming roadmap features include:
1. **Role-Based Access Control (RBAC)**: Fine-grained permissions (e.g., separating "Fleet Managers" who can read data vs "Compliance Officers" who can explicitly execute Pooling).
2. **Comprehensive Audit Logs**: Every CB mutation (banking, pooling allocation) will append to an append-only JSONb immutable log stream in Postgres for regulatory PDF reporting.
3. **Redis Caching Tier**: Caching computationally heavy baseline queries that span entire fleet histories using Redis strings with automated cache-invalidation driven by the domain events.
4. **CI/CD Triggers**: GitHub Actions pipelines mapping to `eslint`, `vitest` domain tests, and automated Docker container pushes to AWS ECR/ECS.
