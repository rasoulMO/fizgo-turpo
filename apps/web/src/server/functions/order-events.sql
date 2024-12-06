-- Function to create initial ORDER_PLACED event
CREATE OR REPLACE FUNCTION on_order_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM order_events 
    WHERE order_id = NEW.id AND event_type = 'ORDER_PLACED'
  ) THEN
    INSERT INTO order_events (
      order_id,
      event_type,
      description,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      'ORDER_PLACED',
      'Order has been placed successfully',
      jsonb_build_object(
        'total', NEW.total,
        'subtotal', NEW.subtotal,
        'delivery_fee', NEW.delivery_fee
      ),
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and handle order status transitions
CREATE OR REPLACE FUNCTION validate_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Validate status transitions
  CASE OLD.status
    WHEN 'ORDER_PLACED' THEN
      IF NEW.status NOT IN ('PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from ORDER_PLACED to %', NEW.status;
      END IF;
    
    WHEN 'PAYMENT_COMPLETED' THEN
      IF NEW.status NOT IN ('PREPARATION_STARTED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from PAYMENT_COMPLETED to %', NEW.status;
      END IF;
    
    WHEN 'PREPARATION_STARTED' THEN
      IF NEW.status NOT IN ('READY_FOR_PICKUP', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from PREPARATION_STARTED to %', NEW.status;
      END IF;
    
    WHEN 'READY_FOR_PICKUP' THEN
      IF NEW.status NOT IN ('PICKUP_COMPLETED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from READY_FOR_PICKUP to %', NEW.status;
      END IF;
    
    WHEN 'PICKUP_COMPLETED' THEN
      IF NEW.status NOT IN ('OUT_FOR_DELIVERY', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from PICKUP_COMPLETED to %', NEW.status;
      END IF;
    
    WHEN 'OUT_FOR_DELIVERY' THEN
      IF NEW.status NOT IN ('DELIVERY_ATTEMPTED', 'DELIVERED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from OUT_FOR_DELIVERY to %', NEW.status;
      END IF;
    
    WHEN 'DELIVERED' THEN
      IF NEW.status NOT IN ('REFUND_REQUESTED', 'REFUND_PROCESSED') THEN
        RAISE EXCEPTION 'Invalid status transition from DELIVERED to %', NEW.status;
      END IF;
    
    WHEN 'CANCELLED' THEN
      RAISE EXCEPTION 'Cannot transition from CANCELLED status';
    
    ELSE
      -- Allow transition for any unhandled previous status
      NULL;
  END CASE;

  -- Create corresponding event
  INSERT INTO order_events (
    order_id,
    event_type,
    description,
    created_by,
    metadata
  ) VALUES (
    NEW.id,
    NEW.status,
    CASE NEW.status
      WHEN 'PAYMENT_PENDING' THEN 'Payment is pending'
      WHEN 'PAYMENT_COMPLETED' THEN 'Payment has been completed'
      WHEN 'PREPARATION_STARTED' THEN 'Order preparation has started'
      WHEN 'READY_FOR_PICKUP' THEN 'Order is ready for pickup'
      WHEN 'PICKUP_COMPLETED' THEN 'Order has been picked up'
      WHEN 'OUT_FOR_DELIVERY' THEN 'Order is out for delivery'
      WHEN 'DELIVERY_ATTEMPTED' THEN 'Delivery was attempted'
      WHEN 'DELIVERED' THEN 'Order has been delivered'
      WHEN 'CANCELLED' THEN 'Order has been cancelled'
      WHEN 'REFUND_REQUESTED' THEN 'Refund has been requested'
      WHEN 'REFUND_PROCESSED' THEN 'Refund has been processed'
      ELSE 'Status updated to ' || NEW.status::text
    END,
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'previous_status', OLD.status,
      'new_status', NEW.status,
      'total', NEW.total
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace triggers
DROP TRIGGER IF EXISTS tr_order_created ON orders;
CREATE TRIGGER tr_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION on_order_created();

DROP TRIGGER IF EXISTS tr_validate_order_status ON orders;
CREATE TRIGGER tr_validate_order_status
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_order_status();

-- Drop the validate_order_event trigger as it's redundant and causing issues
DROP TRIGGER IF EXISTS tr_validate_order_event ON order_events;