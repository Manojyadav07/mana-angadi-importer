export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          shop_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          shop_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          shop_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          area_en: string | null
          area_te: string | null
          created_at: string | null
          delivery_instructions_en: string | null
          delivery_instructions_te: string | null
          house_details_en: string | null
          house_details_te: string | null
          id: string
          is_default: boolean | null
          label_en: string
          label_te: string
          landmark_en: string
          landmark_te: string
          lat: number | null
          lng: number | null
          phone: string | null
          receiver_name: string | null
          updated_at: string | null
          user_id: string
          village_en: string | null
          village_te: string | null
        }
        Insert: {
          area_en?: string | null
          area_te?: string | null
          created_at?: string | null
          delivery_instructions_en?: string | null
          delivery_instructions_te?: string | null
          house_details_en?: string | null
          house_details_te?: string | null
          id?: string
          is_default?: boolean | null
          label_en: string
          label_te: string
          landmark_en: string
          landmark_te: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          receiver_name?: string | null
          updated_at?: string | null
          user_id: string
          village_en?: string | null
          village_te?: string | null
        }
        Update: {
          area_en?: string | null
          area_te?: string | null
          created_at?: string | null
          delivery_instructions_en?: string | null
          delivery_instructions_te?: string | null
          house_details_en?: string | null
          house_details_te?: string | null
          id?: string
          is_default?: boolean | null
          label_en?: string
          label_te?: string
          landmark_en?: string
          landmark_te?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          receiver_name?: string | null
          updated_at?: string | null
          user_id?: string
          village_en?: string | null
          village_te?: string | null
        }
        Relationships: []
      }
      delivery_fee_rules: {
        Row: {
          base_fee_kirana: number | null
          base_fee_medical: number | null
          base_fee_restaurant: number | null
          created_at: string | null
          free_delivery_min_order: number | null
          id: string
          is_active: boolean | null
          max_fee_cap: number | null
          min_order_restaurant: number | null
          per_km_fee: number | null
          updated_at: string | null
          village_key: string | null
        }
        Insert: {
          base_fee_kirana?: number | null
          base_fee_medical?: number | null
          base_fee_restaurant?: number | null
          created_at?: string | null
          free_delivery_min_order?: number | null
          id?: string
          is_active?: boolean | null
          max_fee_cap?: number | null
          min_order_restaurant?: number | null
          per_km_fee?: number | null
          updated_at?: string | null
          village_key?: string | null
        }
        Update: {
          base_fee_kirana?: number | null
          base_fee_medical?: number | null
          base_fee_restaurant?: number | null
          created_at?: string | null
          free_delivery_min_order?: number | null
          id?: string
          is_active?: boolean | null
          max_fee_cap?: number | null
          min_order_restaurant?: number | null
          per_km_fee?: number | null
          updated_at?: string | null
          village_key?: string | null
        }
        Relationships: []
      }
      delivery_location_updates: {
        Row: {
          delivery_person_id: string | null
          id: string
          lat: number
          lng: number
          order_id: string
          timestamp: string | null
        }
        Insert: {
          delivery_person_id?: string | null
          id?: string
          lat: number
          lng: number
          order_id: string
          timestamp?: string | null
        }
        Update: {
          delivery_person_id?: string | null
          id?: string
          lat?: number
          lng?: number
          order_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_location_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_applications: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_requests: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          request_type: string
          shop_name_en: string | null
          shop_name_te: string | null
          shop_type: Database["public"]["Enums"]["shop_type"] | null
          status: string | null
          updated_at: string | null
          village_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          request_type: string
          shop_name_en?: string | null
          shop_name_te?: string | null
          shop_type?: Database["public"]["Enums"]["shop_type"] | null
          status?: string | null
          updated_at?: string | null
          village_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          request_type?: string
          shop_name_en?: string | null
          shop_name_te?: string | null
          shop_type?: Database["public"]["Enums"]["shop_type"] | null
          status?: string | null
          updated_at?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_requests_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_image_url_snapshot: string | null
          product_name_en_snapshot: string
          product_name_te_snapshot: string
          product_price_snapshot: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_image_url_snapshot?: string | null
          product_name_en_snapshot: string
          product_name_te_snapshot: string
          product_price_snapshot: number
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_image_url_snapshot?: string | null
          product_name_en_snapshot?: string
          product_name_te_snapshot?: string
          product_price_snapshot?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          approx_distance_km: number | null
          assigned_at: string | null
          cancelled_at: string | null
          cod_change_needed_for: number | null
          created_at: string | null
          customer_address_text_en: string | null
          customer_address_text_te: string | null
          delivered_at: string | null
          delivery_address_id: string | null
          delivery_fee: number | null
          delivery_instructions_en: string | null
          delivery_instructions_te: string | null
          delivery_person_id: string | null
          drop_lat: number | null
          drop_lng: number | null
          eta_max: number | null
          eta_min: number | null
          id: string
          note: string | null
          on_the_way_at: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          picked_up_at: string | null
          placed_at: string | null
          ready_at: string | null
          shop_id: string
          shop_name_en_snapshot: string | null
          shop_name_te_snapshot: string | null
          shop_pickup_lat: number | null
          shop_pickup_lng: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
          upi_proof_image_url: string | null
          upi_txn_ref: string | null
          upi_vpa_used: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          approx_distance_km?: number | null
          assigned_at?: string | null
          cancelled_at?: string | null
          cod_change_needed_for?: number | null
          created_at?: string | null
          customer_address_text_en?: string | null
          customer_address_text_te?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_instructions_en?: string | null
          delivery_instructions_te?: string | null
          delivery_person_id?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          eta_max?: number | null
          eta_min?: number | null
          id?: string
          note?: string | null
          on_the_way_at?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          picked_up_at?: string | null
          placed_at?: string | null
          ready_at?: string | null
          shop_id: string
          shop_name_en_snapshot?: string | null
          shop_name_te_snapshot?: string | null
          shop_pickup_lat?: number | null
          shop_pickup_lng?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
          upi_proof_image_url?: string | null
          upi_txn_ref?: string | null
          upi_vpa_used?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          approx_distance_km?: number | null
          assigned_at?: string | null
          cancelled_at?: string | null
          cod_change_needed_for?: number | null
          created_at?: string | null
          customer_address_text_en?: string | null
          customer_address_text_te?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_instructions_en?: string | null
          delivery_instructions_te?: string | null
          delivery_person_id?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          eta_max?: number | null
          eta_min?: number | null
          id?: string
          note?: string | null
          on_the_way_at?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          picked_up_at?: string | null
          placed_at?: string | null
          ready_at?: string | null
          shop_id?: string
          shop_name_en_snapshot?: string | null
          shop_name_te_snapshot?: string | null
          shop_pickup_lat?: number | null
          shop_pickup_lng?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          upi_proof_image_url?: string | null
          upi_txn_ref?: string | null
          upi_vpa_used?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          is_active: boolean | null
          name_en: string
          name_te: string
          price: number
          shop_id: string
          stock_quantity: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name_en: string
          name_te: string
          price: number
          shop_id: string
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name_en?: string
          name_te?: string
          price?: number
          shop_id?: string
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          merchant_status: Database["public"]["Enums"]["merchant_status"] | null
          phone: string | null
          preferred_language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          merchant_status?:
            | Database["public"]["Enums"]["merchant_status"]
            | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          merchant_status?:
            | Database["public"]["Enums"]["merchant_status"]
            | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_open: boolean | null
          name_en: string
          name_te: string
          owner_id: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          type: Database["public"]["Enums"]["shop_type"]
          updated_at: string | null
          upi_payee_name: string | null
          upi_vpa: string | null
          village_id: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_open?: boolean | null
          name_en: string
          name_te: string
          owner_id?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          type?: Database["public"]["Enums"]["shop_type"]
          updated_at?: string | null
          upi_payee_name?: string | null
          upi_vpa?: string | null
          village_id?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_open?: boolean | null
          name_en?: string
          name_te?: string
          owner_id?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          type?: Database["public"]["Enums"]["shop_type"]
          updated_at?: string | null
          upi_payee_name?: string | null
          upi_vpa?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          created_at: string | null
          district_en: string | null
          district_te: string | null
          id: string
          is_active: boolean | null
          mandal_en: string | null
          mandal_te: string | null
          name_en: string
          name_te: string
          pin_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_en?: string | null
          district_te?: string | null
          id?: string
          is_active?: boolean | null
          mandal_en?: string | null
          mandal_te?: string | null
          name_en: string
          name_te: string
          pin_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_en?: string | null
          district_te?: string | null
          id?: string
          is_active?: boolean | null
          mandal_en?: string | null
          mandal_te?: string | null
          name_en?: string
          name_te?: string
          pin_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_cart_and_add: {
        Args: {
          _product_id: string
          _quantity?: number
          _shop_id: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_delivery: { Args: { _user_id: string }; Returns: boolean }
      is_merchant: { Args: { _user_id: string }; Returns: boolean }
      owns_shop: {
        Args: { _shop_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "merchant" | "delivery" | "admin"
      merchant_status: "pending" | "approved" | "rejected"
      order_status:
        | "placed"
        | "accepted"
        | "ready"
        | "assigned"
        | "picked_up"
        | "on_the_way"
        | "delivered"
        | "cancelled"
      payment_method: "cod" | "upi"
      payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
      shop_type: "kirana" | "restaurant" | "medical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "merchant", "delivery", "admin"],
      merchant_status: ["pending", "approved", "rejected"],
      order_status: [
        "placed",
        "accepted",
        "ready",
        "assigned",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cod", "upi"],
      payment_status: ["unpaid", "pending", "paid", "failed", "refunded"],
      shop_type: ["kirana", "restaurant", "medical"],
    },
  },
} as const
