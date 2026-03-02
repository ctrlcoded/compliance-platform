# PostgreSQL Schema Design

## 1. Overview
This document defines the PostgreSQL schema for the FuelEU Compliance system. 

The database must:
* Preserve regulatory correctness (Annex IV, Article 20, Article 21)
* Prevent illegal states at the persistence layer
* Support auditability
* Maintain deterministic calculations
* Enforce integrity via constraints (not just application logic)

**Core tables:**
* `routes`
* `ship_compliance`
* `bank_entries`
* `pools`
* `pool_members`

**Design Principles:**
* Strong referential integrity
* Explicit CHECK constraints
* Immutable ledger entries
* No soft-delete for regulatory data
* Audit-friendly timestamps

---

## 2. ER Relationship Overview



```text
ships (logical identity via ship_id)
   │
   ├── routes
   │
   ├── ship_compliance
   │        │
   │        └── bank_entries
   │
   └── pool_members
            │
            └── pools
```

---

## 3. TABLE: routes
Stores route-level data and baseline flag.

**Schema**
```sql
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id VARCHAR(50) NOT NULL,
    ship_id VARCHAR(50) NOT NULL,
    vessel_type VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    ghg_intensity NUMERIC(10,4) NOT NULL,
    fuel_consumption_tonnes NUMERIC(14,4) NOT NULL,
    distance_km NUMERIC(14,2) NOT NULL,
    total_emissions_tonnes NUMERIC(14,4) NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Constraints**
```sql
ALTER TABLE routes
ADD CONSTRAINT chk_year_valid
CHECK (year >= 2025);

ALTER TABLE routes
ADD CONSTRAINT chk_positive_consumption
CHECK (fuel_consumption_tonnes >= 0);

ALTER TABLE routes
ADD CONSTRAINT chk_positive_intensity
CHECK (ghg_intensity >= 0);
```

**Why These Constraints Exist:**
* `year >= 2025` → Regulation effective year.
* `fuel_consumption >= 0` → Negative fuel impossible.
* `ghg_intensity >= 0` → Regulatory metric cannot be negative.

**Unique Baseline Constraint**
Only one baseline per ship per year.
```sql
CREATE UNIQUE INDEX ux_route_baseline_per_ship_year
ON routes(ship_id, year)
WHERE is_baseline = TRUE;
```

**Why:**
FuelEU comparison logic requires exactly one baseline. This prevents application bugs from creating multiple baselines.

**Indexes**
```sql
CREATE INDEX idx_routes_ship_year ON routes(ship_id, year);
CREATE INDEX idx_routes_year ON routes(year);
```
*For filtering and comparison queries.*

---

## 4. TABLE: ship_compliance
Represents the yearly compliance snapshot.

**Schema**
```sql
CREATE TABLE ship_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    target_intensity NUMERIC(10,4) NOT NULL,
    actual_intensity NUMERIC(10,4) NOT NULL,
    energy_in_scope NUMERIC(18,4) NOT NULL,
    compliance_balance NUMERIC(20,4) NOT NULL,
    adjusted_compliance_balance NUMERIC(20,4),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(ship_id, year)
);
```

**Constraints**
```sql
ALTER TABLE ship_compliance
ADD CONSTRAINT chk_energy_positive
CHECK (energy_in_scope >= 0);

ALTER TABLE ship_compliance
ADD CONSTRAINT chk_target_positive
CHECK (target_intensity >= 0);

ALTER TABLE ship_compliance
ADD CONSTRAINT chk_actual_positive
CHECK (actual_intensity >= 0);
```

**Why:**
* Energy cannot be negative.
* Intensity must always be valid.
* `UNIQUE(ship_id, year)` ensures one compliance record per reporting year.

**Indexes**
```sql
CREATE INDEX idx_ship_compliance_ship_year
ON ship_compliance(ship_id, year);
```

---

## 5. TABLE: bank_entries
Ledger table for Article 20 Banking. Immutable design.



**Schema**
```sql
CREATE TABLE bank_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount NUMERIC(20,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Constraints**
```sql
ALTER TABLE bank_entries
ADD CONSTRAINT chk_bank_type
CHECK (type IN ('BANK', 'APPLY'));

ALTER TABLE bank_entries
ADD CONSTRAINT chk_bank_amount_positive
CHECK (amount > 0);
```

**Foreign Key**
```sql
ALTER TABLE bank_entries
ADD CONSTRAINT fk_bank_ship
FOREIGN KEY (ship_id, year)
REFERENCES ship_compliance(ship_id, year)
ON DELETE RESTRICT;
```

**Why These Constraints Exist:**
* Banking must be immutable (ledger style).
* No negative banking allowed.
* Must relate to a valid compliance year.
* `ON DELETE RESTRICT` ensures regulatory history cannot be deleted.

**Indexes**
```sql
CREATE INDEX idx_bank_ship_year
ON bank_entries(ship_id, year);
```

---

## 6. TABLE: pools
Represents an Article 21 pool.

**Schema**
```sql
CREATE TABLE pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Constraints**
```sql
ALTER TABLE pools
ADD CONSTRAINT chk_pool_year
CHECK (year >= 2025);
```

**Indexes**
```sql
CREATE INDEX idx_pools_year ON pools(year);
```

---

## 7. TABLE: pool_members
Members inside a pool.

**Schema**
```sql
CREATE TABLE pool_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL,
    ship_id VARCHAR(50) NOT NULL,
    cb_before NUMERIC(20,4) NOT NULL,
    cb_after NUMERIC(20,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Foreign Keys**
```sql
ALTER TABLE pool_members
ADD CONSTRAINT fk_pool_members_pool
FOREIGN KEY (pool_id)
REFERENCES pools(id)
ON DELETE CASCADE;
```

**Constraints**
```sql
ALTER TABLE pool_members
ADD CONSTRAINT chk_cb_values_valid
CHECK (cb_before IS NOT NULL AND cb_after IS NOT NULL);
```

**Why:**
* `CASCADE` delete ensures no orphan members.
* `cb_before` and `cb_after` must always be recorded for audit.

**Indexes**
```sql
CREATE INDEX idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX idx_pool_members_ship ON pool_members(ship_id);
```

---

## 8. Relationships Summary

| Parent | Child | Relationship |
| :--- | :--- | :--- |
| `ship_compliance` | `bank_entries` | 1:N |
| `pools` | `pool_members` | 1:N |
| `ship_compliance` | `pool_members` | (logical) Reference only |

---

## 9. Seed Strategy

* **Routes:** Insert 5 predefined routes for 2024–2025.
* **ship_compliance:** Compute CB for seeded routes using: `Energy ≈ fuelConsumption × 41,000 MJ/t`
* **Baseline:** Set one baseline per ship/year.
* **Target Intensity:** Hardcode 2025 target = 89.3368.

---

## 10. Migration Plan



Use versioned migrations.

**Example:**
```text
V001__create_routes.sql
V002__create_ship_compliance.sql
V003__create_bank_entries.sql
V004__create_pools.sql
V005__create_pool_members.sql
```

**Migration Rules:**
* Never modify an old migration.
* Use additive schema changes.
* Never drop compliance data.
* Add audit columns if the regulation updates.

---

## 11. Regulatory Integrity Guarantees
**Database ensures:**
* One compliance record per year.
* One baseline per ship/year.
* No negative bank entries.
* No orphan pool members.
* No deletion of regulatory ledger data.

**Application enforces:**
* Compliance formula correctness.
* Pool sum ≥ 0.
* Banking ≤ available surplus.

---

## 12. Why Constraints Matter
This system is regulation-backed.

**If data becomes inconsistent:**
* Pool could violate Article 21.
* Banking could exceed legal surplus.
* CB could be recalculated incorrectly.
* Audit exposure becomes severe.

**Therefore:**
* Domain logic enforces rules.
* Database prevents structural corruption.
* Both layers must protect integrity.

---

## 13. Scalability Considerations
* Indexes on `ship_id` + `year` support reporting queries.
* Numeric precision allows large fleet scaling.
* Ledger table supports financial audit scale.
* Partitioning by year possible in the future.

---

## 14. Final Integrity Rule
**If a row can exist in the database, it must represent a legally valid regulatory state.** No illegal compliance configuration should ever persist.