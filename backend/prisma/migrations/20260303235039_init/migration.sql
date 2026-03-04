-- CreateEnum
CREATE TYPE "BankEntryType" AS ENUM ('BANK', 'APPLY');

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" VARCHAR(50) NOT NULL,
    "ship_id" VARCHAR(50) NOT NULL,
    "vessel_type" VARCHAR(50) NOT NULL,
    "fuel_type" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "ghg_intensity" DECIMAL(10,4) NOT NULL,
    "fuel_consumption_tonnes" DECIMAL(14,4) NOT NULL,
    "distance_km" DECIMAL(14,2) NOT NULL,
    "total_emissions_tonnes" DECIMAL(14,4) NOT NULL,
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship_compliance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ship_id" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "target_intensity" DECIMAL(10,4) NOT NULL,
    "actual_intensity" DECIMAL(10,4) NOT NULL,
    "energy_in_scope" DECIMAL(18,4) NOT NULL,
    "compliance_balance" DECIMAL(20,4) NOT NULL,
    "adjusted_compliance_balance" DECIMAL(20,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ship_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ship_id" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "BankEntryType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pool_id" UUID NOT NULL,
    "ship_id" VARCHAR(50) NOT NULL,
    "cb_before" DECIMAL(20,4) NOT NULL,
    "cb_after" DECIMAL(20,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pool_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routes_ship_id_year_idx" ON "routes"("ship_id", "year");

-- CreateIndex
CREATE INDEX "routes_year_idx" ON "routes"("year");

-- CreateIndex
CREATE INDEX "ship_compliance_ship_id_year_idx" ON "ship_compliance"("ship_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ship_compliance_ship_id_year_key" ON "ship_compliance"("ship_id", "year");

-- CreateIndex
CREATE INDEX "bank_entries_ship_id_year_idx" ON "bank_entries"("ship_id", "year");

-- CreateIndex
CREATE INDEX "pools_year_idx" ON "pools"("year");

-- CreateIndex
CREATE INDEX "pool_members_pool_id_idx" ON "pool_members"("pool_id");

-- CreateIndex
CREATE INDEX "pool_members_ship_id_idx" ON "pool_members"("ship_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- AddForeignKey
ALTER TABLE "bank_entries" ADD CONSTRAINT "bank_entries_ship_id_year_fkey" FOREIGN KEY ("ship_id", "year") REFERENCES "ship_compliance"("ship_id", "year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
