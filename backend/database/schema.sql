-- ============================================================
--  CLÍNICA VETERINARIA — SCHEMA COMPLETO
--  Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ─── TIPOS ENUM ──────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'clientela', 'veterinario', 'ventas');
CREATE TYPE pet_status AS ENUM ('available', 'adopted', 'unavailable');
CREATE TYPE adoption_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- ─── TABLA: users ────────────────────────────────────────────
-- Perfil extendido sincronizado con auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT,
    phone       TEXT,
    role        user_role NOT NULL DEFAULT 'clientela',
    is_adopter  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: pets ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    species     TEXT NOT NULL,          -- 'perro', 'gato', etc.
    breed       TEXT,
    age_years   NUMERIC(4,1),
    description TEXT,
    image_url   TEXT,
    status      pet_status NOT NULL DEFAULT 'available',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: adoptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.adoptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pet_id      UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    status      adoption_status NOT NULL DEFAULT 'pending',
    notes       TEXT,                   -- Motivo de solicitud del adoptante
    admin_notes TEXT,                   -- Notas internas del admin
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, pet_id)            -- Un usuario no puede aplicar dos veces por la misma mascota
);

-- ─── TABLA: products ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category    TEXT,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: orders ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subtotal         NUMERIC(10,2) NOT NULL,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    total            NUMERIC(10,2) NOT NULL,
    status           order_status NOT NULL DEFAULT 'pending',
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: order_items ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL,  -- Precio al momento de la compra
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: services ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    description      TEXT,
    price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: appointments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vet_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
    service_id       UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    pet_id           UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    scheduled_at     TIMESTAMPTZ NOT NULL,
    status           appointment_status NOT NULL DEFAULT 'scheduled',
    base_price       NUMERIC(10,2) NOT NULL,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_paid       NUMERIC(10,2) NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: medical_records ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id         UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vet_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis      TEXT NOT NULL,
    treatment      TEXT,
    notes          TEXT,
    recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_adoptions_user_id       ON public.adoptions(user_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_pet_id        ON public.adoptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_status        ON public.adoptions(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id    ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id     ON public.appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id  ON public.medical_records(pet_id);

-- ─── FUNCIÓN: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_pets_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_adoptions_updated_at
    BEFORE UPDATE ON public.adoptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── RLS (Row Level Security) ────────────────────────────────
-- RLS DESHABILITADO: toda la autorización se gestiona en Express
-- mediante los middlewares authenticate + authorizeRoles.
-- El backend siempre opera con service_role desde el servidor.
ALTER TABLE public.users           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoptions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;
