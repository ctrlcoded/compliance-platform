# End-to-End Testing Strategy

## 1. Overview
This document defines the testing strategy for the FuelEU Maritime Compliance Platform.

**Objectives:**
* Ensure regulatory correctness (Annex IV, Article 20, Article 21)
* Validate mathematical accuracy
* Guarantee domain integrity
* Prevent illegal compliance states
* Achieve high coverage of core business logic



**Testing layers:**
* Unit Tests (Core domain & use cases)
* Integration Tests (HTTP endpoints + DB)
* Edge Case Tests
* Mathematical Validation Tests
* Failure Scenario Tests
* Coverage Strategy

---

## 2. Testing Philosophy
This system is regulation-driven.

**Therefore:**
* Core domain must be 100% deterministic
* Mathematical formulas must be reproducible
* Pooling and banking rules must be strictly enforced
* Infrastructure must not affect business correctness

**Rule:**
> If a test fails in the domain layer, compliance could be legally invalid.

---

## 3. Unit Tests — Core Use Cases
Unit tests target:
`backend/src/core`

* No database.
* No HTTP.
* Pure TypeScript.

### 3.1 ComputeCB (Compliance Balance)
**Target Class:** `ComplianceCalculator`

**Formula:**
`CB = (Target − Actual) × Energy`

**Test Cases:**
* **Case 1 — Surplus**
  * Target = 89.3368, Actual = 88.0, Energy = 100,000
  * **Expected:** `CB > 0`
* **Case 2 — Deficit**
  * Target = 89.3368, Actual = 91.0, Energy = 100,000
  * **Expected:** `CB < 0`
* **Case 3 — Equal**
  * Target = 89.3368, Actual = 89.3368
  * **Expected:** `CB = 0`
* **Case 4 — Zero Energy**
  * Energy = 0
  * **Expected:** `CB = 0`
* **Case 5 — Large Energy**
  * Energy = 10^9
  * **Ensure:** No overflow, precision maintained

### 3.2 ComputeComparison
**Target Class:** `CompareRoutesUseCase`

**Test Cases:**
* **Case 1 — Improvement**
  * Baseline = 91.0, Comparison = 88.0
  * **Expected:** `percentDiff < 0`, `compliant = true`
* **Case 2 — Worse**
  * Baseline = 88.0, Comparison = 91.0
  * **Expected:** `percentDiff > 0`
* **Case 3 — Equal**
  * **Expected:** `percentDiff = 0`

**Validation:**
`percentDiff = ((comparison / baseline) − 1) × 100`
*Ensure rounding precision is consistent.*

### 3.3 BankSurplus (Article 20)
**Target Class:** `BankingService`

**Test Cases:**
* **Case 1 — Valid Bank**
  * CB = +5,000,000, Bank 3,000,000
  * **Expected:** Remaining surplus = 2,000,000
* **Case 2 — Bank Exact Surplus**
  * **Expected:** Remaining = 0
* **Case 3 — Bank More Than Surplus**
  * **Expected:** Throw error
* **Case 4 — Bank Negative CB**
  * **Expected:** Reject
* **Case 5 — Bank Zero**
  * **Expected:** Reject

### 3.4 ApplyBanked
**Test Cases:**
* **Case 1 — Apply Valid**
  * Banked = 5,000,000, Apply = 2,000,000
  * **Expected:** Remaining = 3,000,000
* **Case 2 — Apply More Than Available**
  * **Expected:** Reject
* **Case 3 — Apply When No Bank Exists**
  * **Expected:** Reject
* **Case 4 — Apply To Surplus Year**
  * If CB positive → cannot apply
  * **Expected:** Reject

### 3.5 CreatePool (Article 21)
**Target Class:** `PoolAllocator`

**Test Cases:**
* **Case 1 — Valid Pool**
  * S1 = +5,000,000, S2 = -3,000,000 (Sum = +2,000,000)
  * **Expected:** S2 → 0, S1 → 2,000,000
* **Case 2 — Sum Negative**
  * S1 = -3,000,000, S2 = -2,000,000
  * **Expected:** Reject pool creation
* **Case 3 — Surplus Insufficient**
  * S1 = +2,000,000, S2 = -3,000,000 (Sum = -1,000,000)
  * **Expected:** Reject
* **Case 4 — Multiple Surplus Ships**
  * Ensure greedy allocation works correctly.
* **Case 5 — Deficit Ship Not Worse**
  * Before = -3,000,000, After must be ≥ -3,000,000
* **Case 6 — Surplus Ship Not Negative**
  * Before = +5,000,000, After must be ≥ 0

---

## 4. Integration Tests — HTTP Endpoints
Use:
* Supertest
* Test database (separate schema)
* Test full request lifecycle.

### 4.1 `/routes`
* `GET` returns seeded routes
* Baseline uniqueness enforced
* Invalid routeId returns `404`

### 4.2 `/compliance/cb`
* Correct formula output
* Deterministic results
* Invalid shipId → `404`
* Invalid year → `400`

### 4.3 `/banking/bank`
* Valid bank → `201`
* Over-bank → `422`
* Negative amount → `400`

### 4.4 `/banking/apply`
* Apply valid → `200`
* Apply over-limit → `409`
* Apply without bank → `409`

### 4.5 `/pools`
* Valid pool → `201`
* Sum negative → `409`
* Single ship → `400`
* Ship not found → `404`

---

## 5. Mathematical Validation Cases
These validate numerical correctness.

**Precision Test**
* Use high precision decimal inputs.
* Ensure: No floating rounding errors beyond tolerance. Use `NUMERIC` type consistently.

**Large Fleet Simulation**
* Simulate 100 ships: Random CB values. Ensure sum invariant respected.

**Determinism Test**
* Run `ComputeCB` 1,000 times with the same input.
* **Expected:** Always identical output.

---

## 6. Edge Cases
* CB exactly zero
* Bank entire surplus
* Pool exactly sum = 0
* Pool all ships surplus
* Pool all ships deficit
* Very large energy values
* Year boundary conditions (2025 min)

---

## 7. Failure Case Testing

**Regulatory Violations**
* Negative fuel consumption
* Multiple baselines
* Banking deficit
* Pool violating surplus protection
* *All must throw domain error.*

**Database Failures**
* Foreign key violation
* Duplicate compliance record
* Constraint violation
* *Ensure correct HTTP mapping.*

**Invalid JSON**
* Missing required fields
* Wrong data types
* Null values
* **Expected:** `400 Bad Request`

---

## 8. Test Coverage Strategy



**Domain Layer**
* **Target:** ≥ 95% coverage
* **Critical functions:** `ComputeCB`, `PoolAllocator`, `BankingService` must be 100% covered.

**Application Layer**
* **Target:** ≥ 85% coverage
* Use case orchestration tested.

**Adapter Layer**
* Basic coverage for: Request mapping, Error translation.
* No need for 100%.

**Mutation Testing (Optional Advanced)**
* Apply mutation testing to: Pool allocation logic, Banking validation logic.
* Ensure logic cannot be weakened without failing tests.

---

## 9. Test Data Strategy
Use:
* Deterministic seed values
* Explicit CB values
* Known test fixtures
* *Never use random in core tests.*

---

## 10. Regression Strategy
**Whenever:**
* Target intensity changes
* Formula changes
* Pooling logic updates
**→ Add regression tests immediately.**

---

## 11. Performance Testing
**Simulate:**
* 1,000 ships compliance calculation
* Pool with 100 ships

**Ensure:**
* Execution < acceptable threshold
* No memory leak

---

## 12. Compliance Assurance Checklist
Before release:
* [x] `ComputeCB` tested
* [x] Banking rules enforced
* [x] Pool rules validated
* [x] Mathematical edge cases tested
* [x] DB constraints tested
* [x] All regulatory invariants enforced

---

## 13. Final Rule
If a test fails in:
* `ComputeCB` → compliance invalid
* `Banking` → illegal surplus state
* `Pooling` → Article 21 violation

**System must not deploy.**