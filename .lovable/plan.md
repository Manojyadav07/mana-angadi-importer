

# Switch to Lovable Cloud Backend

## Problem
The app is hardcoded to an external database (`yrqxuwttnqcewivcfmgu`) that is missing columns the frontend expects (e.g., `is_active`, `eta_max`, `drop_lat`). The Lovable Cloud database (`rhtxwutgbzptvyxutytm`) already has the correct schema.

## Plan

### Step 1 -- Delete `src/lib/supabaseClient.ts`
This file contains hardcoded credentials pointing to the wrong database. It will be removed entirely.

### Step 2 -- Restore `src/integrations/supabase/client.ts`
Revert this file to the standard auto-generated Cloud client (which uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the environment). This file is auto-managed, so we simply stop overriding it.

### Step 3 -- Update all 13 import paths
Every file that imports from `@/lib/supabaseClient` will be updated to import from `@/integrations/supabase/client` instead:

- `src/context/AuthContext.tsx`
- `src/context/auth/authHelpers.ts`
- `src/context/auth/postAuthRedirect.ts`
- `src/hooks/useAddresses.ts`
- `src/hooks/useDeliveryEarnings.ts`
- `src/hooks/useDeliveryFeeRules.ts`
- `src/hooks/useDeliveryLocation.ts`
- `src/hooks/useMerchantShopCheck.ts`
- `src/hooks/useOrders.ts`
- `src/hooks/useProductImageUpload.ts`
- `src/hooks/useProducts.ts`
- `src/hooks/useRealtimeLocation.ts`
- `src/hooks/useShops.ts`
- `src/pages/MerchantShopSetupPage.tsx`

Each change is a single-line replacement:
```
// Before
import { supabase } from '@/lib/supabaseClient';
// After
import { supabase } from '@/integrations/supabase/client';
```

### Result
The app will connect to the Lovable Cloud database where all required columns already exist, immediately unblocking product fetch and order creation.

