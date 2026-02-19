
-- Remove duplicate SELECT policy (keep the EXISTS-based one which is more standard)
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

-- Add INSERT policy for order_items
CREATE POLICY "Users can insert own order items"
ON order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
