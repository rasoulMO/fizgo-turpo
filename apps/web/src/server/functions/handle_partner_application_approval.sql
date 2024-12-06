CREATE OR REPLACE FUNCTION public.handle_partner_application_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        -- Update user role to SHOP_OWNER
        UPDATE public.users 
        SET role = 'SHOP_OWNER'
        WHERE id = NEW.user_id;
        
        -- Create shop
        INSERT INTO public.shops (
            id,
            owner_id,
            name,
            description,
            address,
            phone,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            NEW.user_id,
            NEW.business_name,
            NEW.business_description,
            NEW.business_address,
            NEW.business_phone,
            'PENDING',
            NOW(),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_partner_application_approval
    AFTER UPDATE ON public.partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_partner_application_approval();