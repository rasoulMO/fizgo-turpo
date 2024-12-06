CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_specifications_updated_at
    BEFORE UPDATE ON public.product_specifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


