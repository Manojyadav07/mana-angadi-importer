# COD & UPI Payment Reconciliation Guide

## Overview

Mana Angadi supports two payment methods: **Cash on Delivery (COD)** and **UPI**. This document outlines how to reconcile payments across the order lifecycle.

---

## Payment Status Lifecycle

| Status     | Meaning                                      |
|------------|----------------------------------------------|
| `unpaid`   | Order placed, no payment collected yet (COD)  |
| `pending`  | UPI payment initiated, awaiting confirmation  |
| `paid`     | Payment collected/confirmed                   |
| `failed`   | UPI payment failed                            |
| `refunded` | Payment returned to customer                  |

---

## COD Reconciliation

### Flow
1. Customer places order → `payment_method = 'cod'`, `payment_status = 'unpaid'`
2. Optionally, `cod_change_needed_for` stores the denomination the customer will pay with
3. Delivery partner collects cash on delivery
4. On status change to `delivered` → `payment_status = 'paid'`, `paid_at = now()`

### Daily Reconciliation Query
```sql
-- COD orders delivered today, pending cash handover to merchant
SELECT 
  o.id,
  o.shop_name_en_snapshot AS shop,
  o.total,
  o.cod_change_needed_for,
  o.delivered_at,
  p.display_name AS delivery_partner
FROM orders o
LEFT JOIN profiles p ON p.user_id = o.delivery_person_id
WHERE o.payment_method = 'cod'
  AND o.status = 'delivered'
  AND o.delivered_at::date = CURRENT_DATE
ORDER BY o.delivered_at;
```

### Settlement Process
1. At end of day, admin runs the above query
2. Delivery partner hands over total COD collected minus their delivery fee
3. Admin marks settlement complete (manual tracking for MVP)

---

## UPI Reconciliation

### Flow
1. Customer selects UPI → `payment_method = 'upi'`, `payment_status = 'pending'`
2. Customer enters UPI transaction reference → stored in `upi_txn_ref`
3. Customer uploads proof screenshot → stored in `upi-proofs` storage bucket at `{user_id}/{order_id}.jpg`
4. Merchant/Admin verifies the payment
5. On delivery → `payment_status = 'paid'`, `paid_at = now()`

### Verification Query
```sql
-- UPI orders pending verification
SELECT 
  o.id,
  o.shop_name_en_snapshot AS shop,
  o.total,
  o.upi_txn_ref,
  o.upi_vpa_used,
  o.upi_proof_image_url,
  o.payment_status,
  o.created_at
FROM orders o
WHERE o.payment_method = 'upi'
  AND o.payment_status = 'pending'
ORDER BY o.created_at;
```

### Failed UPI Payments
```sql
-- Orders where UPI failed, may need COD fallback
SELECT id, shop_name_en_snapshot, total, upi_txn_ref, created_at
FROM orders
WHERE payment_method = 'upi' AND payment_status = 'failed';
```

---

## Daily Summary Report

```sql
-- Daily revenue summary by payment method
SELECT 
  payment_method,
  payment_status,
  COUNT(*) AS order_count,
  SUM(total) AS total_revenue,
  SUM(delivery_fee) AS total_delivery_fees,
  SUM(subtotal) AS total_product_revenue
FROM orders
WHERE delivered_at::date = CURRENT_DATE
  AND status = 'delivered'
GROUP BY payment_method, payment_status;
```

---

## Merchant Payout Calculation

```sql
-- Per-merchant payout for delivered orders today
SELECT 
  o.shop_id,
  o.shop_name_en_snapshot,
  COUNT(*) AS orders_delivered,
  SUM(o.subtotal) AS merchant_payout,
  SUM(o.delivery_fee) AS delivery_fees_collected
FROM orders o
WHERE o.status = 'delivered'
  AND o.delivered_at::date = CURRENT_DATE
GROUP BY o.shop_id, o.shop_name_en_snapshot;
```

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `orders` | Core order data with payment fields |
| `order_items` | Line items with price snapshots |
| `delivery_location_updates` | GPS tracking during delivery |

## Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `upi-proofs` | UPI payment screenshot proofs (private, RLS-protected) |
| `product-images` | Product catalog images (public) |

---

## Notes for MVP

- Settlement is **manual** for launch (admin runs queries, tracks in spreadsheet)
- UPI gateway integration is planned post-MVP for automated verification
- Refund workflow is not yet automated — admin manually processes via bank transfer
- `cod_change_needed_for` helps delivery partners prepare correct change
