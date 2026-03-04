# REST API Specification



## 1. Overview
This document defines the REST API for the FuelEU Maritime Compliance backend. 

The API supports:
* Route management
* Compliance Balance calculation
* Banking (Article 20)
* Pooling (Article 21)

**Base URL:**
`/api/v1`

**Content-Type:**
`application/json`

All responses follow a consistent structure:

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation"
  }
}
```

---

## 2. Common Validation Rules
All endpoints enforce:
* `year` must be an integer ≥ 2025
* `shipId` must be a non-empty string
* Numeric fields must be finite numbers
* No NaN or Infinity allowed
* All regulatory formulas validated inside the domain layer

---

## 3. ROUTES MODULE

### 3.1 GET /routes
Retrieve all routes.

**Query Parameters**
| Parameter | Type | Required |
| :--- | :--- | :--- |
| `vesselType` | string | No |
| `fuelType` | string | No |
| `year` | number | No |

**Example Request**
```http
GET /api/v1/routes?year=2025
```

**Success Response (200)**
```json
{
  "data": [
    {
      "routeId": "R001",
      "shipId": "S1",
      "vesselType": "Container",
      "fuelType": "HFO",
      "year": 2025,
      "ghgIntensity": 91.0,
      "fuelConsumptionTonnes": 5000,
      "distanceKm": 12000,
      "totalEmissionsTonnes": 4500,
      "isBaseline": true
    }
  ]
}
```

**Validation Rules**
* `year` must be a valid integer
* Filters must match known enums (if defined)

**Error Cases**
* `400` — Invalid query parameter
* `404` — No routes found (optional decision)
* `500` — Internal server error

### 3.2 POST /routes/:routeId/baseline
Set route as baseline for its ship/year.

**Request**
```http
POST /api/v1/routes/R001/baseline
```

**Success (200)**
```json
{
  "data": {
    "routeId": "R001",
    "isBaseline": true
  }
}
```

**Validation Rules**
* Only one baseline per ship per year
* Route must exist

**Error Cases**
* `404` — Route not found
* `409` — Baseline already exists
* `400` — Invalid routeId

### 3.3 GET /routes/comparison
Compare baseline with other routes.

**Query Parameters**
| Parameter | Required |
| :--- | :--- |
| `shipId` | Yes |
| `year` | Yes |

**Example Request**
```http
GET /api/v1/routes/comparison?shipId=S1&year=2025
```

**Success (200)**
```json
{
  "data": {
    "target": 89.3368,
    "baseline": {
      "routeId": "R001",
      "ghgIntensity": 91.0
    },
    "comparisons": [
      {
        "routeId": "R002",
        "ghgIntensity": 88.0,
        "percentDiff": -3.29,
        "compliant": true
      }
    ]
  }
}
```

**Validation Rules**
* Baseline must exist
* Target intensity must match reporting year

**Error Cases**
* `404` — Baseline not found
* `400` — Invalid year
* `500` — Calculation error

---

## 4. COMPLIANCE MODULE

### 4.1 GET /compliance/cb
Compute Compliance Balance.

**Query Parameters**
| Parameter | Required |
| :--- | :--- |
| `shipId` | Yes |
| `year` | Yes |

**Example Request**
```http
GET /api/v1/compliance/cb?shipId=S1&year=2025
```

**Success (200)**
```json
{
  "data": {
    "shipId": "S1",
    "year": 2025,
    "targetIntensity": 89.3368,
    "actualIntensity": 91.0,
    "energyInScope": 205000000,
    "complianceBalance": -3400000
  }
}
```

**Formula Validation**
`CB = (Target − Actual) × Energy`
* Must match deterministic domain calculation
* Energy must be ≥ 0

**Edge Cases**
* Actual = Target → CB = 0
* Actual > Target → Negative CB
* Actual < Target → Positive CB

**Error Cases**
* `400` — Invalid shipId/year
* `404` — Ship data not found
* `500` — Formula failure

### 4.2 GET /compliance/adjusted-cb
Return CB after banking applied.

**Query Parameters**
| Parameter | Required |
| :--- | :--- |
| `shipId` | Yes |
| `year` | Yes |

**Response**
```json
{
  "data": {
    "shipId": "S1",
    "year": 2025,
    "cbBefore": -3400000,
    "bankApplied": 2000000,
    "cbAfter": -1400000
  }
}
```

**Validation**
* Applied amount must not exceed banked surplus

---

## 5. BANKING MODULE (Article 20)

### 5.1 GET /banking/records
Retrieve bank ledger.

**Query Parameters**
| Parameter | Required |
| :--- | :--- |
| `shipId` | Yes |
| `year` | Yes |

**Response (200)**
```json
{
  "data": [
    {
      "bankEntryId": "B001",
      "type": "BANK",
      "amount": 5000000,
      "createdAt": "2025-02-01T10:00:00Z"
    }
  ]
}
```

### 5.2 POST /banking/bank
Bank positive surplus.

**Request**
```json
{
  "shipId": "S1",
  "year": 2025,
  "amount": 5000000
}
```

**Validation Rules**
* Compliance Balance must be positive
* `amount` > 0
* `amount` ≤ available surplus

**Success (201)**
```json
{
  "data": {
    "bankedAmount": 5000000,
    "remainingSurplus": 1000000
  }
}
```

**Error Cases**
* `400` — Invalid input
* `409` — No surplus available
* `422` — Amount exceeds surplus

### 5.3 POST /banking/apply
Apply banked surplus.

**Request**
```json
{
  "shipId": "S1",
  "year": 2026,
  "amount": 2000000
}
```

**Validation Rules**
* `amount` > 0
* `amount` ≤ banked surplus
* Cannot apply to surplus year

**Success (200)**
```json
{
  "data": {
    "applied": 2000000,
    "remainingBanked": 3000000
  }
}
```

**Error Cases**
* `409` — Insufficient banked amount
* `422` — Cannot apply to surplus year

---

## 6. POOLING MODULE (Article 21)

### 6.1 POST /pools
Create pool.

**Request**
```json
{
  "year": 2025,
  "shipIds": ["S1", "S2", "S3"]
}
```

**Validation Rules (Pre-Allocation)**
* At least 2 ships
* All ships must exist
* Sum(CB) ≥ 0

**Allocation Rules**
* Greedy surplus-to-deficit transfer
* Deficit ship cannot exit worse
* Surplus ship cannot exit negative

**Success (201)**
```json
{
  "data": {
    "poolId": "P123",
    "members": [
      {
        "shipId": "S1",
        "cbBefore": 5000000,
        "cbAfter": 2000000
      },
      {
        "shipId": "S2",
        "cbBefore": -3000000,
        "cbAfter": 0
      }
    ]
  }
}
```

**Error Cases**
* `400` — Invalid payload
* `404` — Ship not found
* `409` — Sum of CB < 0
* `422` — Allocation rule violation

### 6.2 GET /pools/:poolId
Retrieve pool details.

**Response**
```json
{
  "data": {
    "poolId": "P123",
    "year": 2025,
    "members": [
      {
        "shipId": "S1",
        "cbBefore": 5000000,
        "cbAfter": 2000000
      },
      {
        "shipId": "S2",
        "cbBefore": -3000000,
        "cbAfter": 0
      }
    ]
  }
}
```

---

## 7. HTTP Status Code Summary

| Code | Meaning |
| :--- | :--- |
| `200` | Success |
| `201` | Created |
| `400` | Validation error |
| `404` | Resource not found |
| `409` | Conflict (regulatory rule violation) |
| `422` | Business rule failure |
| `500` | Internal error |

---

## 8. Edge Case Summary
* CB exactly zero
* Attempt to bank zero
* Attempt to apply more than available
* Pool with only deficit ships
* Pool where surplus insufficient
* Duplicate baseline route
* Missing target intensity
* Negative fuel consumption

*All edge cases must be rejected at the domain layer before persistence.*

---

## 9. Determinism & Auditability
All calculations must:
* Be deterministic
* Be reproducible
* Log inputs used
* Store calculation snapshots if needed
* No silent adjustments allowed

---

## 10. Final Rule
**If a request:**
* Violates Annex IV formula → **reject**
* Violates Article 20 → **reject**
* Violates Article 21 → **reject**

Validation must occur in the domain layer before adapter persistence.