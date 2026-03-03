-- Custom Constraints Migration for FuelEU Compliance DB

-- 1. Routes Table Check Constraints
ALTER TABLE routes ADD CONSTRAINT chk_year_valid CHECK (year >= 2025);
ALTER TABLE routes ADD CONSTRAINT chk_positive_consumption CHECK (fuel_consumption_tonnes >= 0);
ALTER TABLE routes ADD CONSTRAINT chk_positive_intensity CHECK (ghg_intensity >= 0);

-- Partial Unique Index (Only 1 baseline per ship per year)
CREATE UNIQUE INDEX ux_route_baseline_per_ship_year ON routes(ship_id, year) WHERE is_baseline = TRUE;

-- 2. Ship Compliance Table Constraints
ALTER TABLE ship_compliance ADD CONSTRAINT chk_energy_positive CHECK (energy_in_scope >= 0);
ALTER TABLE ship_compliance ADD CONSTRAINT chk_target_positive CHECK (target_intensity >= 0);
ALTER TABLE ship_compliance ADD CONSTRAINT chk_actual_positive CHECK (actual_intensity >= 0);

-- 3. Bank Entries Table Constraints
ALTER TABLE bank_entries ADD CONSTRAINT chk_bank_amount_positive CHECK (amount > 0);

-- 4. Pools Table Constraints
ALTER TABLE pools ADD CONSTRAINT chk_pool_year CHECK (year >= 2025);
