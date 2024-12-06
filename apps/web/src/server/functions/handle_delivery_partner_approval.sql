-- Create the trigger function
CREATE OR REPLACE FUNCTION update_delivery_partner_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the timestamp update trigger
CREATE TRIGGER trigger_update_delivery_partner_profile_timestamp
    BEFORE UPDATE ON delivery_partner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_partner_profile_updated_at();

-- Create the approval trigger
CREATE OR REPLACE FUNCTION public.handle_delivery_partner_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        -- Update user role to DELIVERY_PARTNER
        UPDATE public.users 
        SET role = 'DELIVERY_PARTNER'
        WHERE id = NEW.user_id;
        
        -- Create delivery partner profile
        INSERT INTO public.delivery_partner_profiles (
            partner_id,
            vehicle_type,
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_plate_number,
            drivers_license_number,
            drivers_license_expiry,
            preferred_work_areas,
            available_hours
        ) VALUES (
            NEW.user_id,
            NEW.vehicle_type,
            NEW.vehicle_make,
            NEW.vehicle_model,
            NEW.vehicle_year,
            NEW.vehicle_plate_number,
            NEW.drivers_license_number,
            NEW.drivers_license_expiry,
            NEW.preferred_work_areas,
            NEW.available_hours::jsonb
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the approval trigger
CREATE TRIGGER on_delivery_partner_approval
    AFTER UPDATE ON public.delivery_partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_delivery_partner_approval();