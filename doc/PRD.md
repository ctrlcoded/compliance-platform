# 📘 Product Requirements Document (PRD)
## FuelEU Maritime Compliance Platform

---

# 1. Problem Statement

Shipping companies operating within the EU/EEA must comply with Regulation (EU) 2023/1805 (FuelEU Maritime), which introduces:

- A declining GHG intensity limit on energy used onboard ships
- Annual Compliance Balance (CB) calculations
- Financial penalties for non-compliance
- Flexibility mechanisms (Banking, Borrowing, Pooling)

Compliance calculations are complex, formula-driven (Annex I, II, IV), and often managed through fragmented spreadsheets and manual processes.

There is a need for a structured, auditable, and modular compliance platform that:

- Computes GHG intensity and Compliance Balance correctly
- Implements Article 20 (Banking) and Article 21 (Pooling)
- Ensures regulatory correctness and traceability
- Provides an operational dashboard for decision-making

---

# 2. Regulatory Context – FuelEU Maritime (EU) 2023/1805

## 2.1 Core Obligation (Article 4)

Ships must meet a yearly GHG intensity limit (gCO₂eq/MJ) of energy used onboard.

For 2025:

- Reference value: 91.16 gCO₂eq/MJ
- Required reduction: 2%
- Target intensity: 89.3368 gCO₂eq/MJ

## 2.2 Compliance Balance (Annex IV)

Annual Compliance Balance (CB):
CB = (Target − Actual) × Energy_in_scope


- Positive CB → Surplus
- Negative CB → Deficit (financial penalty exposure)

## 2.3 Flexibility Mechanisms

### Article 20 – Banking
- Surplus may be carried forward.
- Surplus can be applied to future deficits.

### Article 21 – Pooling
- Ships may pool compliance.
- Aggregate adjusted CB must be ≥ 0.
- Allocation rules must protect:
  - Deficit ships from worsening
  - Surplus ships from becoming negative

---

# 3. Product Scope

The platform will include:

- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + TypeScript + PostgreSQL
- Architecture: Hexagonal (Ports & Adapters)
- Strict separation of domain logic from frameworks

Modules:
1. Routes
2. Compare
3. Banking
4. Pooling

---

# 4. Functional Requirements

---

## 4.1 Routes Module

### Objective
Manage route-level emission and intensity data.

### Features
- `GET /routes` – Retrieve all routes
- Filtering:
  - vesselType
  - fuelType
  - year
- Display columns:
  - routeId
  - vesselType
  - fuelType
  - year
  - ghgIntensity (gCO₂eq/MJ)
  - fuelConsumption (t)
  - distance (km)
  - totalEmissions (t)
- `POST /routes/:routeId/baseline`
  - Only one active baseline per year

### Business Rules
- Baseline must be unique per reporting year
- Data must be stored in PostgreSQL
- Intensity values must follow FuelEU Annex I methodology

---

## 4.2 Compare Module

### Objective
Evaluate compliance relative to baseline and regulatory target.

### Target (2025)
89.3368 gCO₂eq/MJ


### Formula
percentDiff = ((comparison / baseline) − 1) × 100


### Endpoint
`GET /routes/comparison`

### Output
For each route:
- ghgIntensity
- percentDiff
- compliant (boolean)
- comparison vs regulatory target

### UI
- Table view
- Chart (bar or line)
- Compliance indicator (✅ / ❌)

---

## 4.3 Banking Module (Article 20)

### Objective
Manage surplus compliance balances.

### Endpoints
- `GET /compliance/cb?shipId&year`
- `GET /banking/records?shipId&year`
- `POST /banking/bank`
- `POST /banking/apply`

### Business Rules
- Only positive CB may be banked
- Cannot apply more than available banked surplus
- Banking creates immutable ledger entry
- Applying reduces stored surplus
- Reject banking if CB ≤ 0

### KPIs
- cb_before
- banked_amount
- applied_amount
- cb_after

---

## 4.4 Pooling Module (Article 21)

### Objective
Allow ships to share compliance surplus and deficit.

### Endpoint
`POST /pools`

### Validation Rules
1. Sum(adjustedCB) ≥ 0
2. Deficit ship cannot exit worse than entry
3. Surplus ship cannot exit negative
4. Allocation algorithm:
   - Sort members by CB descending
   - Transfer surplus to deficits greedily

### Output
Per member:
- cb_before
- cb_after

### UI Requirements
- Member selection list
- Before/after comparison
- Pool sum indicator (green/red)
- Disable "Create Pool" if invalid

---

# 5. Non-Functional Requirements

## 5.1 Architecture
- Strict hexagonal separation
- No framework dependencies in core
- Ports define contracts
- Adapters implement HTTP and persistence

## 5.2 Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Clean domain naming
- Unit test coverage for core use cases

## 5.3 Performance
- CB calculation < 200ms
- Pool allocation < 500ms

## 5.4 Security
- Input validation
- SQL injection protection
- Audit logging for CB adjustments

## 5.5 Observability
- Structured logging
- Error tracking
- Compliance audit traceability

---

# 6. User Personas

## 1. Compliance Officer
- Reviews annual CB
- Executes banking and pooling
- Requires audit defensibility

## 2. Fleet Technical Manager
- Compares fuel strategies
- Evaluates emission reduction scenarios

## 3. CFO / Finance Controller
- Monitors penalty exposure
- Optimizes banking vs pooling strategy

## 4. Sustainability Analyst
- Models intensity scenarios
- Tracks GHG improvement over time

---

# 7. KPIs

## Compliance KPIs
- % compliant vessels
- Total fleet CB
- Banked surplus volume
- Pooled compliance delta

## Operational KPIs
- Average fleet GHG intensity
- % routes below regulatory target
- Surplus utilization rate

## Financial KPIs
- Estimated penalty exposure
- Avoided penalties via pooling
- Cost per ton CO₂eq avoided

---

# 8. Assumptions & Constraints

## Assumptions
- 2025 target fixed at 89.3368 gCO₂eq/MJ
- Energy in scope ≈ fuelConsumption × 41,000 MJ/t
- No Extra-EEA complexity in MVP
- Wind reward factor fw = 1

## Constraints
- PostgreSQL only
- Hexagonal architecture mandatory
- AI-agent documentation required
- 72-hour implementation window

---

# 9. Out of Scope (MVP)

- Borrowing mechanism (Article 20 advance compliance)
- Annex III zero-emission at berth
- RFNBO subtarget tracking
- EU ETS integration
- Multi-tenant fleet management
- Authentication/authorization system
- PoS/PoC document parsing

---

# 10. Success Criteria

The product is successful if:

- Routes, Compare, Banking, and Pooling work end-to-end
- CB calculations follow Annex IV methodology
- Pool validation enforces Article 21 constraints
- Domain logic is framework-agnostic
- Unit and integration tests pass
- Documentation (AGENT_WORKFLOW.md, README.md, REFLECTION.md) is complete