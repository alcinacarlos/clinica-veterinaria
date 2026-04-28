-- ============================================================
--  FUNCIÓN RPC: decrement_stock
--  Llamada desde el controlador de órdenes para reducir stock
--  de forma atómica. Ejecutar en el SQL Editor de Supabase.
-- ============================================================

CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_product_id UUID,
    p_quantity    INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - p_quantity
    WHERE id = p_product_id
      AND stock >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %', p_product_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario: SECURITY DEFINER permite que la función se ejecute
-- con los privilegios del propietario (service_role), garantizando
-- que el UPDATE atómico no sea bloqueado por RLS.
