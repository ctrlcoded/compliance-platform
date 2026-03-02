# Domain-Driven Design (DDD) Model

## 1. Domain Overview
The FuelEU Compliance domain models regulatory compliance under Regulation (EU) 2023/1805. 

It focuses on:
* GHG intensity calculation
* Compliance Balance computation
* Banking surplus (Article 20)
* Pooling compliance (Article 21)

The domain is math-heavy, rule-driven, and regulation-constrained. Therefore, **all business rules must live inside the domain layer.**

The domain is designed using:
* Entities
* Value Objects
* Aggregates
* Domain Services
* Invariants
* Explicit regulatory validation

---

## 2. Ubiquitous Language

| Term | Meaning |
| :--- | :--- |
| **GHG Intensity** | gCO₂eq per MJ |
| **Target Intensity** | Regulatory threshold for given year |
| **Compliance Balance (CB)** | (Target − Actual) × Energy |
| **Surplus** | Positive CB |
| **Deficit** | Negative CB |
| **Banked Amount** | Stored positive surplus |
| **Adjusted CB** | CB after banking application |
| **Pool** | Group compliance settlement |

---

## 3. Value Objects
Value Objects are immutable and validated at creation.

### 3.1 GHGIntensity
Represents well-to-wake intensity.
* **Attributes:** `value: number` (gCO₂eq/MJ)
* **Invariants:** * Must be ≥ 0
  * Must be a finite number
* **Behavior:** `compareTo(other)`, `isBelow(target)`

### 3.2 EnergyInScope
Represents total annual energy.
* **Attributes:** `value: number` (MJ)
* **Invariants:** Must be ≥ 0

### 3.3 ComplianceBalanceValue
Represents computed CB.
* **Attributes:** `value: number` (gCO₂eq equivalent)
* **Derived Meaning:** * Positive → Surplus
  * Negative → Deficit
* **Invariants:** * Must be finite
  * Cannot be NaN
* **Behavior:** `isSurplus()`, `isDeficit()`, `add()`, `subtract()`

### 3.4 ReportingYear
* **Attributes:** `year: number`
* **Invariants:** * Must be ≥ 2025
  * Must be an integer

### 3.5 ShipId
Strongly typed identity wrapper.

---



## 4. Entities
Entities have identity and lifecycle.

### 4.1 Route
Represents a fuel-consuming route for a ship.
* **Attributes:** `routeId`, `shipId`, `vesselType`, `fuelType`, `year`, `ghgIntensity: GHGIntensity`, `fuelConsumptionTonnes`, `distanceKm`, `totalEmissionsTonnes`, `isBaseline: boolean`
* **Invariants:**
  * Only one baseline per year per ship
  * `ghgIntensity` must be valid
  * `fuelConsumption` ≥ 0
* **Business Rules:**
  * Baseline route must be unique
  * Intensity must follow Annex I calculation logic (external domain service)

### 4.2 ShipCompliance (Aggregate Root)
Represents yearly compliance state of a ship.
* **Attributes:** `shipId`, `year`, `targetIntensity: GHGIntensity`, `actualIntensity: GHGIntensity`, `energyInScope: EnergyInScope`, `complianceBalance: ComplianceBalanceValue`, `bankedSurplus: number`, `adjustedComplianceBalance: ComplianceBalanceValue`
* **Invariants:**
  * `complianceBalance` must equal formula result
  * `adjustedComplianceBalance = complianceBalance + appliedBank`
  * Banked surplus cannot be negative
* **Business Rules:**
  * Compliance Balance must follow Annex IV formula
  * Banking only allowed if surplus exists
  * Adjusted CB must reflect bank applications

### 4.3 ComplianceBalance
Encapsulates regulatory formula.

**Formula:**
`CB = (Target − Actual) × Energy_in_scope`

**Validation Rules:**
* Target and Actual must be valid intensities
* Energy must be ≥ 0
* Result must be reproducible and deterministic

**Edge Case Handling:**
* If Actual > Target → CB negative (deficit)
* If Actual < Target → CB positive (surplus)
* If equal → CB = 0

### 4.4 BankEntry
Represents banking transaction.
* **Attributes:** `bankEntryId`, `shipId`, `year`, `amount`, `type: BANK | APPLY`, `createdAt`
* **Invariants:**
  * amount must be > 0
  * Cannot bank deficit
  * Cannot apply more than available banked surplus

### 4.5 Pool (Aggregate Root)
Represents Article 21 pooling mechanism.
* **Attributes:** `poolId`, `year`, `members: List<PoolMember>`, `createdAt`
* **Invariants:**
  * Must contain ≥ 2 ships
  * Sum of adjusted CB before allocation ≥ 0
  * After allocation:
    * No deficit ship exits worse
    * No surplus ship becomes negative

### 4.6 PoolMember
Represents ship inside pool.
* **Attributes:** `shipId`, `cbBefore`, `cbAfter`
* **Invariants:**
  * `cbAfter` must be computed by allocator
  * If `cbBefore` < 0 → `cbAfter` ≥ `cbBefore`
  * If `cbBefore` > 0 → `cbAfter` ≥ 0

---

## 5. Aggregate Boundaries

**ShipCompliance Aggregate**
* **Root:** ShipCompliance
* **Contains:** ComplianceBalance, BankEntries
* **Rules enforced inside:** Banking logic, Adjusted CB calculation
* *External entities cannot modify banked surplus directly.*

**Pool Aggregate**
* **Root:** Pool
* **Contains:** PoolMembers
* **Rules enforced inside:** Pool allocation, Regulatory validation
* *No external modification allowed after creation.*

---

## 6. Domain Services

### 6.1 ComplianceCalculator
Responsible for:
* Computing ComplianceBalance
* Validating formula correctness

**Method:**
```typescript
calculate(target, actual, energy): ComplianceBalanceValue
```
*(Pure function)*

### 6.2 BankingService (Article 20)
Handles: Bank surplus, Apply banked surplus.

**Validation Rules:**
* **Banking:**
  * CB must be positive
  * Cannot bank more than CB
  * Bank amount must be > 0
* **Applying:**
  * Must have banked surplus
  * Cannot apply more than stored
  * Adjusted CB updated correctly

### 6.3 PoolAllocator (Article 21)
Implements greedy algorithm.

**Algorithm:**
1. Sort ships descending by CB
2. Transfer surplus to deficits
3. Stop when: All deficits resolved OR Surplus exhausted

**Pooling Validation Rules:**
* **Before allocation:** Σ CB ≥ 0
* **After allocation:**
  * Deficit ship: `cbAfter ≥ cbBefore`
  * Surplus ship: `cbAfter ≥ 0`
* *If any violation → reject pool creation.*

---

## 7. Regulatory Validation Summary

**Compliance Balance (Annex IV)**
* ✔ Target must match reporting year
* ✔ CB must equal formula
* ✔ Deterministic and auditable

**Banking (Article 20)**
* ✔ Only surplus can be banked
* ✔ No negative bank entries
* ✔ Cannot over-apply
* ✔ Bank is ledger-based (immutable entries)

**Pooling (Article 21)**
* ✔ Sum ≥ 0
* ✔ Deficit ship protected
* ✔ Surplus ship protected
* ✔ Allocation deterministic

---

## 8. Domain Integrity Guarantees
The domain ensures:
* No invalid compliance state can exist
* No negative bank storage
* No illegal pool formation
* Regulatory formulas enforced centrally
* All math testable without infrastructure

---

## 9. Domain Design Principles Applied
* Explicit aggregate roots
* Immutable value objects
* Encapsulated invariants
* Pure domain services
* No framework dependency
* Regulatory constraints as code

---

## 10. Final Boundary Rule

**If a rule relates to:**
* FuelEU formula
* Compliance Balance
* Banking legality
* Pooling legality
**→ It must live in the domain layer.**

**If it relates to:**
* HTTP
* Database
* JSON formatting
**→ It must NOT live in the domain.**