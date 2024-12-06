-- Function to create tasks for new orders
CREATE OR REPLACE FUNCTION create_order_tasks()
RETURNS TRIGGER AS $$
DECLARE
    shop_owner_id UUID;
    product_record RECORD;
BEGIN
    -- Get the shop owner ID from the first order item's product
    SELECT p.shop_id, s.owner_id 
    INTO product_record
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE p.id = (
        SELECT product_id 
        FROM order_items 
        WHERE order_id = NEW.id 
        LIMIT 1
    );

    -- Create task for shop owner
    INSERT INTO tasks (
        title,
        description,
        status,
        label,
        priority,
        created_by,
        assigned_to,
        related_order_id,
        related_shop_id,
        metadata
    ) VALUES (
        'Process Order #' || SUBSTRING(NEW.id::text, 1, 8),
        'New order requires processing:'
        || CHR(10) || '- Order ID: ' || NEW.id
        || CHR(10) || '- Total Amount: $' || NEW.total
        || CHR(10) || 'Please prepare items for delivery.',
        'TODO',
        'NEW_ORDER',
        'HIGH',
        NEW.user_id,
        product_record.owner_id,
        NEW.id,
        product_record.shop_id,
        jsonb_build_object(
            'orderDetails', jsonb_build_object(
                'total', NEW.total,
                'subtotal', NEW.subtotal,
                'delivery_fee', NEW.delivery_fee,
                'notes', NEW.notes
            )
        )
    );

    -- Create task for admin review (unassigned)
    INSERT INTO tasks (
        title,
        description,
        status,
        label,
        priority,
        created_by,
        related_order_id,
        metadata
    ) VALUES (
        'Review Delivery for Order #' || SUBSTRING(NEW.id::text, 1, 8),
        'New order needs delivery assignment:'
        || CHR(10) || '- Order ID: ' || NEW.id
        || CHR(10) || '- Total Amount: $' || NEW.total,
        'TODO',
        'DELIVERY_MANAGEMENT',
        'HIGH',
        NEW.user_id,
        NEW.id,
        jsonb_build_object(
            'orderDetails', jsonb_build_object(
                'total', NEW.total,
                'delivery_fee', NEW.delivery_fee
            )
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function for when an order is cancelled
CREATE OR REPLACE FUNCTION create_order_cancellation_task() 
RETURNS TRIGGER AS $$
BEGIN
    -- Only create task if status changed to CANCELLED
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        INSERT INTO tasks (
            title,
            description,
            status,
            label,
            priority,
            created_by,
            related_order_id,
            metadata
        ) VALUES (
            'Review Cancelled Order #' || SUBSTRING(NEW.id::text, 1, 8),
            'Order has been cancelled and requires review:'
            || CHR(10) || '- Order ID: ' || NEW.id
            || CHR(10) || '- Total Amount: $' || NEW.total
            || CHR(10) || 'Please process refund if payment was made.',
            'TODO',
            'ORDER_MANAGEMENT',
            'HIGH',
            NEW.user_id,
            NEW.id,
            jsonb_build_object(
                'cancellationDetails', jsonb_build_object(
                    'originalTotal', NEW.total,
                    'cancellationDate', CURRENT_TIMESTAMP
                )
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for when an order is ready for pickup
CREATE OR REPLACE FUNCTION create_delivery_pickup_task() 
RETURNS TRIGGER AS $$
BEGIN
    -- Only create task if status changed to READY_FOR_PICKUP
    IF NEW.status = 'READY_FOR_PICKUP' AND OLD.status != 'READY_FOR_PICKUP' THEN
        INSERT INTO tasks (
            title,
            description,
            status,
            label,
            priority,
            created_by,
            related_order_id,
            metadata
        ) VALUES (
            'Assign Delivery - Order #' || SUBSTRING(NEW.id::text, 1, 8),
            'Order is ready for pickup and needs delivery partner:'
            || CHR(10) || '- Order ID: ' || NEW.id
            || CHR(10) || '- Ready Time: ' || CURRENT_TIMESTAMP
            || CHR(10) || 'Please assign delivery partner.',
            'TODO',
            'DELIVERY_PICKUP',
            'URGENT',
            NEW.user_id,
            NEW.id,
            jsonb_build_object(
                'pickupDetails', jsonb_build_object(
                    'readyTime', CURRENT_TIMESTAMP,
                    'orderTotal', NEW.total
                )
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the triggers

-- Trigger for new orders
CREATE TRIGGER on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_tasks();

-- Trigger for cancelled orders
CREATE TRIGGER on_order_cancelled
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'CANCELLED')
    EXECUTE FUNCTION create_order_cancellation_task();

-- Trigger for orders ready for pickup
CREATE TRIGGER on_order_ready_for_pickup
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'READY_FOR_PICKUP')
    EXECUTE FUNCTION create_delivery_pickup_task();

-- Add trigger for task history tracking
CREATE OR REPLACE FUNCTION track_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO task_history (
            task_id,
            changed_by,
            status_from,
            status_to,
            priority_from,
            priority_to,
            assigned_from,
            assigned_to,
            notes
        ) VALUES (
            NEW.id,
            NEW.created_by,  -- You might want to pass this differently
            CASE WHEN OLD.status != NEW.status THEN OLD.status ELSE NULL END,
            CASE WHEN OLD.status != NEW.status THEN NEW.status ELSE NULL END,
            CASE WHEN OLD.priority != NEW.priority THEN OLD.priority ELSE NULL END,
            CASE WHEN OLD.priority != NEW.priority THEN NEW.priority ELSE NULL END,
            CASE WHEN OLD.assigned_to != NEW.assigned_to THEN OLD.assigned_to ELSE NULL END,
            CASE WHEN OLD.assigned_to != NEW.assigned_to THEN NEW.assigned_to ELSE NULL END,
            'Task updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add task history trigger
CREATE TRIGGER track_task_changes
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION track_task_changes();