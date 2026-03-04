# AI Agent Workflow & SDLC Reflection

## Project Information

**Project:** Fuel EU Maritime Compliance Platform  
**Architecture:** Hexagonal Architecture (Ports & Adapters)  
**Tech Stack:** React, Node.js, TypeScript, Express, PostgreSQL, Prisma ORM, TailwindCSS

---

# 1. Executive Summary & AI Orchestration Strategy

As a Senior Software Engineer, I utilized a **dual-agent orchestration strategy** to accelerate the Software Development Life Cycle (SDLC) while maintaining strict production-grade engineering standards.

Artificial Intelligence was not used simply to **generate code**, but instead operated as:

- A **paired programmer**
- An **architecture reviewer**
- A **security auditor**

This allowed rapid development while maintaining **Clean Architecture principles, deterministic domain logic, and production-grade security practices**.

---

## Core AI Tools Utilized

### Gemini 3.1 Pro — *The Implementer*

Gemini was responsible for **rapid implementation and scaffolding tasks**, including:

- Generating the **Hexagonal backend architecture**
- Writing **Express controllers and API wiring**
- Generating **React + Tailwind UI components**
- Executing rapid **debugging and iteration loops**

Gemini handled the **high-volume implementation work**.

---

### Claude Opus 4.6 — *The Principal Architect*

Claude was used as a **senior architectural reviewer and security auditor**.

Responsibilities included:

- Deep **code verification**
- Identifying **security vulnerabilities**
- Validating **domain mathematics**
- Ensuring strict **Clean Architecture boundaries**

Claude effectively acted as a **principal engineer performing code reviews** on AI-generated output.

---

# 2. Phase-by-Phase Execution Log

---

# Phase 1 — Architectural Scaffolding & Domain Design

To ensure **long-term maintainability**, the backend was structured using **Hexagonal Architecture (Ports & Adapters)**.

The core principle enforced was:

> Business logic must remain completely independent from frameworks, databases, and external systems.

---

## Exact Prompt Given

```text
You are a senior backend architect.

Based on the attached documents (ARCHITECTURE.md, DOMAIN_MODEL.md, DATABASE_DESIGN.md),
generate a production-ready backend structure.

Tech stack:
Node.js + TypeScript
Express
PostgreSQL
Prisma

Requirements:
Clean Architecture
Layered design

Output:
Folder structure
package.json
Core bootstrap code
````

---

## Output Received

Gemini generated a **Hexagonal project structure**:

```
backend/
  core/
  ports/
  adapters/
  infrastructure/
```

Additionally generated:

* Dependency injection setup
* Base entity classes
* Bootstrapped Express application
* Environment configuration

---

## Challenges & Mistakes

During the first commit, the AI accidentally pushed large artifacts:

* `node_modules`
* compiled `dist/` files

This caused **massive repository bloat and slow Git operations**.

---

## The Fix

Executed the following command to purge tracked artifacts:

```bash
git rm -r --cached .
```

Then:

* Rewrote `.gitignore`
* Removed build artifacts
* Re-committed a clean repository state

This restored **repository performance and maintainability**.

---

# Phase 2 — Core Compliance Engine & Precision Math

Fuel EU Maritime regulations require **highly deterministic financial calculations**.

Floating-point rounding errors could cause **incorrect compliance balances**, leading to financial risk.

---

## Exact Prompt Given

```text
Act as a senior backend engineer.

Using the domain model implement core services:

ComputeCB
ComputeComparison
BankSurplus
ApplyBanked

Requirements:
Pure domain logic separated from infrastructure
Deterministic calculations
Floating point precision handling
Unit test examples
```

---

## Output Received

The AI generated domain services:

* `ComplianceCalculator`
* `BankingService`
* `PoolAllocator`

These services were implemented **entirely within the domain layer**, independent from Express and Prisma.

---

## Challenges & Mistakes (Identified by Claude Audit)

Two major problems were discovered:

1. `Math.round()` introduced **IEEE-754 floating-point drift**
2. `applyBanked` incorrectly allowed ships to convert **deficits into positive surpluses**

This violated compliance rules.

---

## The Fix

A **Value Object** was introduced:

```
ComplianceBalanceValue
```

A precision utility was created:

```
round4()
```

Implemented using:

```
Number.EPSILON
```

This guarantees **exactly four decimal places of precision**.

Additionally, the `applyBanked` logic was refactored:

```ts
Math.min(requested, availableBank, Math.abs(currentCb))
```

This ensures that banking operations **cannot exceed legal limits**.

---

# Phase 3 — Database Integration & Transaction Safety

Banking and pooling operations involve **financial state mutations**, which require **ACID-compliant database transactions**.

---

## Exact Prompt Given

```text
Refactor these mutation operations to use proper database transactions.

Requirements:

Use Prisma $transaction
Ensure atomic updates
Prevent partial writes
Preserve idempotency logic
Avoid nested transactions
```

---

## Output Received

All mutation operations were wrapped in:

```ts
Prisma.$transaction()
```

This ensures:

* Atomic updates
* Automatic rollback on failure
* Consistent financial state

---

## Challenges & Mistakes

The backend initially failed to start with:

```
ECONNREFUSED
```

The terminal output failed to display the actual compilation error.

---

## The Fix

A **custom debugging script** was written using:

* `child_process.spawnSync`
* `fs.writeFileSync`

This captured the **raw stderr output**.

The root cause was discovered:

Incorrect relative import paths generated by AI.

Incorrect:

```
../../domain
```

Correct:

```
../../../domain
```

A batch replacement across **10+ files** resolved the issue and restored system stability.

---

# Phase 4 — Security Hardening & Authorization

Before integrating the frontend, the backend APIs required **security hardening**.

---

## Exact Prompt Given

```text
Act as a senior security engineer.

Review backend for:

SQL injection risks
Authorization flaws
Broken access control
Data integrity risks

Provide concrete fixes.
```

---

## Output Received

Security improvements implemented:

* `express-rate-limit`
* 1MB JSON request payload limits
* Strict JWT validation
* Algorithm locked to **HS256**

These measures significantly improved **API security and resilience**.

---

## Challenges & Mistakes

Frontend requests began failing with:

```
403 Forbidden
```

The root cause was a **hardcoded fake ship ID**:

```
S1
```

This violated the new **ownership validation middleware**.

---

## The Fix

A development authentication route was created:

```
/api/v1/auth/dev-token
```

This route generates **valid JWT tokens** for local development.

Example token payload:

```
IMO-1111111
```

A React **Axios interceptor** was implemented to automatically attach the token to API requests.

---

# Phase 5 — Frontend Integration & Data Mapping

Once backend APIs were stable, the frontend integration began.

---

## Exact Prompt Given

```text
Create a new page:

/pages/Compare.tsx

On mount fetch:
/routes/comparison

Render a Tailwind table with:

Route ID
Baseline Intensity
Route Intensity
% Difference
Compliance badge

Requirements:
Clean UI
Strong TypeScript typing
```

---

## Output Received

A fully functional React page was generated featuring:

* Clean **Tailwind table layout**
* Conditional **green/red compliance badges**
* Strong **TypeScript typing**
* Proper API integration

---

## Challenges & Mistakes

The **Banking ledger page** returned empty values for:

* `shipId`
* `year`

The frontend also received a **404 error**.

---

## The Fix

An endpoint mismatch was discovered.

Incorrect endpoint:

```
/banking/ledger
```

Correct endpoint:

```
/banking/records
```

After fixing the Axios service URL, another issue was discovered:

The backend `GetLedger` use case did not include `shipId` in the response payload.

The following components were refactored:

* Backend **Use Case**
* Inbound **Port Interface**
* Frontend **TypeScript DTO definitions**

This resolved the data mapping issue.

---

# 3. Key Takeaways & Engineering Insights

---

## AI Requires Architectural Guardrails

Large Language Models tend to choose the **simplest implementation path**, often placing business logic directly inside framework layers.

Strict prompting was required to enforce **Hexagonal Architecture** and maintain proper separation of concerns.

---

## Silent Failures Require Senior Debugging Techniques

When the backend crashed without useful logs, relying on standard terminal output was insufficient.

Using **lower-level Node.js debugging scripts** allowed access to the real compilation errors and quickly unblocked development.

---

## Domain-Driven Design (DDD) Proves Valuable

By isolating compliance calculations within **domain Value Objects**, the floating-point precision bug was fixed with **a single localized change**.

Without DDD boundaries, this bug would have required **large-scale refactoring across multiple layers**.

This demonstrates the long-term maintainability benefits of **strong domain modeling** in complex regulatory systems.

```

---

