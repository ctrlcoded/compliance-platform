# Hexagonal Architecture (Ports & Adapters)

## 1. System Overview
The FuelEU Maritime Compliance Platform is designed using Hexagonal Architecture (Ports & Adapters / Clean Architecture) to ensure:

* Clear separation of concerns
* Framework independence
* Testable domain logic
* Long-term maintainability
* Regulatory correctness isolation

The system is split into two independent applications:
* Frontend – React + TypeScript + Tailwind
* Backend – Node.js + TypeScript + PostgreSQL

The core principle:
**Business logic must not depend on frameworks.**
**Frameworks depend on the core — never the opposite.**

## 2. High-Level Architecture

```text
               ┌──────────────────────────┐
               │        Frontend UI       │
               │  (React + Tailwind)      │
               └──────────────┬───────────┘
                              │ HTTP
                              ▼
               ┌──────────────────────────┐
               │     Inbound Adapter      │
               │     (Express Routes)     │
               └──────────────┬───────────┘
                              ▼
               ┌──────────────────────────┐
               │        Application       │
               │        Use Cases         │
               └──────────────┬───────────┘
                              ▼
               ┌──────────────────────────┐
               │          Domain          │
               │   (Entities + Rules)     │
               └──────────────┬───────────┘
                              ▼
               ┌──────────────────────────┐
               │     Outbound Ports       │
               └──────────────┬───────────┘
                              ▼
               ┌──────────────────────────┐
               │   Infrastructure Adapter │
               │   (Postgres / Prisma)    │
               └──────────────────────────┘
```

## 3. Backend Architecture

### 3.1 Folder Structure

```text
backend/
└── src/
    ├── core/
    │   ├── domain/
    │   │   ├── entities/
    │   │   ├── value-objects/
    │   │   ├── services/
    │   │   └── errors/
    │   │
    │   ├── application/
    │   │   ├── use-cases/
    │   │   ├── dto/
    │   │   └── mappers/
    │   │
    │   └── ports/
    │       ├── inbound/
    │       └── outbound/
    │
    ├── adapters/
    │   ├── inbound/
    │   │   └── http/
    │   │       ├── controllers/
    │   │       └── routes/
    │   │
    │   └── outbound/
    │       └── postgres/
    │           ├── repositories/
    │           └── models/
    │
    ├── infrastructure/
    │   ├── db/
    │   └── server/
    │
    └── shared/
        ├── types/
        └── utils/
```

### 3.2 Core Layer (Framework-Free)

#### 1️⃣ Domain (core/domain)
Contains:
* Entities (Route, ShipCompliance, Pool, BankEntry)
* Value Objects (GHGIntensity, ComplianceBalance)
* Domain services (PoolAllocator, ComplianceCalculator)
* Domain errors

No:
* Express
* Prisma
* Database
* HTTP
* External libraries

This layer contains pure business logic only.

#### 2️⃣ Application (core/application)
Contains:
* Use cases:
  * CreatePool
  * ComputeComplianceBalance
  * BankSurplus
  * ApplyBanked
  * CompareRoutes
* DTOs
* Orchestration logic

This layer:
* Coordinates domain
* Calls outbound ports
* Contains no framework logic

#### 3️⃣ Ports (core/ports)
Ports define contracts.

**Inbound Ports**
Interfaces implemented by application use cases.
Example:
```typescript
CreatePoolUseCase {
  execute(input: CreatePoolInput): Promise<CreatePoolOutput>
}
```

**Outbound Ports**
Interfaces required by the application.
Example:
```typescript
ShipComplianceRepository {
  findByShipIds(ids: string[]): Promise<ShipCompliance[]>
  savePoolAllocation(...)
}
```

Ports are abstractions. Adapters implement them.

## 4. Backend Adapters

### 4.1 Inbound Adapters
Located in:
`adapters/inbound/http`

Contains:
* Express routes
* Controllers
* Request validation
* Response formatting

Allowed here:
* Express
* Zod
* Request/Response objects

Not allowed:
* Business logic

Controllers call use cases via inbound ports.

### 4.2 Outbound Adapters
Located in:
`adapters/outbound/postgres`

Contains:
* Repository implementations
* Prisma or pg client
* SQL models
* Implements outbound ports defined in core.

Allowed:
* PostgreSQL
* Prisma
* SQL

Not allowed:
* Business rules

## 5. Frontend Architecture

### 5.1 Folder Structure

```text
frontend/
└── src/
    ├── core/
    │   ├── domain/
    │   ├── application/
    │   └── ports/
    │
    ├── adapters/
    │   ├── ui/
    │   │   ├── pages/
    │   │   ├── components/
    │   │   └── hooks/
    │   │
    │   └── infrastructure/
    │       └── api/
    │
    └── shared/
        ├── types/
        └── utils/
```

### 5.2 Frontend Core
Contains:
* Business models (Route, CB, PoolMember)
* Client-side validation logic
* Calculation helpers (percentDiff)

No:
* React
* Tailwind
* Axios

### 5.3 UI Adapter
Contains:
* React components
* Hooks
* Tailwind styling
* State management

React lives here only.

### 5.4 Infrastructure Adapter
Contains:
* API client
* Axios/fetch wrapper
* API request mappers
* Implements outbound frontend ports.

## 6. Dependency Flow Rules

**Backend Dependency Flow**
```text
core/domain
    ↑
core/application
    ↑
core/ports
    ↑
adapters
    ↑
infrastructure
```
Allowed direction: Outside → Inside
Forbidden: Core → Framework

**Frontend Dependency Flow**
```text
core (domain + application)
    ↑
adapters (ui + api)
    ↑
React / Tailwind
```

## 7. Where Business Logic Lives
Business logic lives ONLY in:
* `backend/src/core/domain`
* `backend/src/core/application`
* `frontend/src/core`

Examples:
* Compliance Balance formula
* Pool allocation algorithm
* Banking validation
* Target comparison logic

Never in:
* Controllers
* Express routes
* Prisma repositories
* React components

## 8. Where Frameworks Are Allowed
Allowed only in:

**Backend:**
* `adapters/inbound` (Express)
* `adapters/outbound` (Prisma/Postgres)
* `infrastructure` (server setup)

**Frontend:**
* `adapters/ui` (React, Tailwind)
* `adapters/infrastructure` (Axios)

Core must remain pure TypeScript.

## 9. Ports & Adapters Explained
**Ports**
Ports are interfaces that define:
* What the application needs (outbound ports)
* What the outside world can trigger (inbound ports)

They decouple the core from technology.

**Adapters**
Adapters are implementations of ports.

Examples:
* PortAdapterShipComplianceRepositoryPostgresRepositoryCreatePoolUseCaseExpress ControllerRoutesApiPort (frontend)AxiosRoutesClient

Adapters translate:
* HTTP → Use case input
* Database rows → Domain entities
* Domain output → JSON response

## 10. Example Flow — Create Pool (End-to-End)
Let’s walk through a full request.

**Step 1 — UI Action**
User clicks: “Create Pool”
React component calls:
```javascript
api.createPool(memberIds)
```

**Step 2 — HTTP Request**
`POST /pools`
Payload:
```json
{
  "shipIds": ["S1", "S2", "S3"],
  "year": 2025
}
```

**Step 3 — Inbound Adapter**
Express Controller:
* Validates input
* Calls `CreatePoolUseCase.execute(input)`

No business logic here.

**Step 4 — Application Layer**
`CreatePoolUseCase`
* Fetches CB values via outbound port
* Calls Domain `PoolAllocator`
* Validates:
  * Sum ≥ 0
  * No ship exits worse
  * No surplus ship becomes negative
* Persists result via repository port

**Step 5 — Domain Logic**
`PoolAllocator`:
* Sort ships descending by CB
* Greedy allocation
* Returns updated CB per ship

Pure function. No DB. No HTTP.

**Step 6 — Outbound Adapter**
Postgres Repository:
* Saves pool
* Saves pool members
* Updates CB records

**Step 7 — Response**
Controller returns:
```json
{
  "poolId": "P123",
  "members": [
    { "shipId": "S1", "cbBefore": 500, "cbAfter": 0 }
  ]
}
```

## 11. Architectural Guarantees
This architecture ensures:
* Domain logic fully testable without database
* Pooling logic reusable in other systems
* Switching Postgres → MongoDB requires adapter change only
* Switching Express → Fastify affects only inbound adapter
* Frontend framework swap does not affect business logic

## 12. Design Principles Enforced
* Dependency inversion
* Single responsibility
* Explicit boundaries
* Pure domain core
* Test-first business rules
* Infrastructure replaceability

## 13. Final Rule
If a file imports:
* express
* react
* prisma
* axios

It must NOT live inside core.

If it contains:
* Compliance math
* Pool allocation
* Banking validation

It MUST live inside core.