export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_item: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_item_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          item_id: string
          last_message_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["ChatConversationStatus"]
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          item_id: string
          last_message_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["ChatConversationStatus"]
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          last_message_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["ChatConversationStatus"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["ChatMessageType"]
          offer_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type: Database["public"]["Enums"]["ChatMessageType"]
          offer_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["ChatMessageType"]
          offer_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "user_item_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          phone_number: string
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          phone_number: string
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone_number?: string
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partner_applications: {
        Row: {
          address: string
          application_number: string
          available_hours: Json | null
          created_at: string
          date_of_birth: string
          documents: Json | null
          drivers_license_expiry: string | null
          drivers_license_number: string | null
          email: string
          full_name: string
          has_delivery_experience: boolean
          id: string
          notes: string[] | null
          phone_number: string
          preferred_work_areas: string[] | null
          previous_companies: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["DeliveryPartnerApplicationStatus"]
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate_number: string | null
          vehicle_type: Database["public"]["Enums"]["VehicleType"]
          vehicle_year: number | null
          years_of_experience: number | null
        }
        Insert: {
          address: string
          application_number?: string
          available_hours?: Json | null
          created_at?: string
          date_of_birth: string
          documents?: Json | null
          drivers_license_expiry?: string | null
          drivers_license_number?: string | null
          email: string
          full_name: string
          has_delivery_experience?: boolean
          id?: string
          notes?: string[] | null
          phone_number: string
          preferred_work_areas?: string[] | null
          previous_companies?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["DeliveryPartnerApplicationStatus"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type: Database["public"]["Enums"]["VehicleType"]
          vehicle_year?: number | null
          years_of_experience?: number | null
        }
        Update: {
          address?: string
          application_number?: string
          available_hours?: Json | null
          created_at?: string
          date_of_birth?: string
          documents?: Json | null
          drivers_license_expiry?: string | null
          drivers_license_number?: string | null
          email?: string
          full_name?: string
          has_delivery_experience?: boolean
          id?: string
          notes?: string[] | null
          phone_number?: string
          preferred_work_areas?: string[] | null
          previous_companies?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["DeliveryPartnerApplicationStatus"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type?: Database["public"]["Enums"]["VehicleType"]
          vehicle_year?: number | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_partner_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partner_profiles: {
        Row: {
          available_hours: Json | null
          created_at: string
          drivers_license_expiry: string | null
          drivers_license_number: string | null
          id: string
          partner_id: string
          preferred_work_areas: string[] | null
          rating: number
          status: Database["public"]["Enums"]["DeliveryPartnerStatus"]
          total_deliveries: number
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate_number: string | null
          vehicle_type: string
          vehicle_year: number | null
        }
        Insert: {
          available_hours?: Json | null
          created_at?: string
          drivers_license_expiry?: string | null
          drivers_license_number?: string | null
          id?: string
          partner_id: string
          preferred_work_areas?: string[] | null
          rating?: number
          status?: Database["public"]["Enums"]["DeliveryPartnerStatus"]
          total_deliveries?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type: string
          vehicle_year?: number | null
        }
        Update: {
          available_hours?: Json | null
          created_at?: string
          drivers_license_expiry?: string | null
          drivers_license_number?: string | null
          id?: string
          partner_id?: string
          preferred_work_areas?: string[] | null
          rating?: number
          status?: Database["public"]["Enums"]["DeliveryPartnerStatus"]
          total_deliveries?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type?: string
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_configurations: {
        Row: {
          created_at: string
          delivery_fee_percentage: number
          effective_from: string
          id: string
          is_active: boolean
          minimum_payout_amount: number
          payout_schedule_days: number[] | null
          platform_fee_percentage: number
          shop_fee_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_fee_percentage: number
          effective_from: string
          id?: string
          is_active?: boolean
          minimum_payout_amount: number
          payout_schedule_days?: number[] | null
          platform_fee_percentage: number
          shop_fee_percentage: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_fee_percentage?: number
          effective_from?: string
          id?: string
          is_active?: boolean
          minimum_payout_amount?: number
          payout_schedule_days?: number[] | null
          platform_fee_percentage?: number
          shop_fee_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      item_likes: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_likes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_type: Database["public"]["Enums"]["OrderEventStatus"]
          id: string
          location: Json | null
          metadata: Json | null
          order_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: Database["public"]["Enums"]["OrderEventStatus"]
          id?: string
          location?: Json | null
          metadata?: Json | null
          order_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: Database["public"]["Enums"]["OrderEventStatus"]
          id?: string
          location?: Json | null
          metadata?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
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
          address_id: string
          created_at: string
          delivery_fee: number
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["OrderEventStatus"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id: string
          created_at?: string
          delivery_fee: number
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["OrderEventStatus"]
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string
          created_at?: string
          delivery_fee?: number
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["OrderEventStatus"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_orders: {
        Row: {
          accepted_offer_id: string | null
          buyer_id: string
          cancellation_reason: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_method: Database["public"]["Enums"]["DeliveryMethod"]
          id: string
          item_id: string
          seller_id: string
          status: Database["public"]["Enums"]["P2POrderStatus"]
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_offer_id?: string | null
          buyer_id: string
          cancellation_reason?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_method: Database["public"]["Enums"]["DeliveryMethod"]
          id?: string
          item_id: string
          seller_id: string
          status?: Database["public"]["Enums"]["P2POrderStatus"]
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_offer_id?: string | null
          buyer_id?: string
          cancellation_reason?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_method?: Database["public"]["Enums"]["DeliveryMethod"]
          id?: string
          item_id?: string
          seller_id?: string
          status?: Database["public"]["Enums"]["P2POrderStatus"]
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_orders_accepted_offer_id_fkey"
            columns: ["accepted_offer_id"]
            isOneToOne: false
            referencedRelation: "user_item_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          application_number: string
          business_address: string
          business_description: string | null
          business_email: string
          business_name: string
          business_phone: string
          business_registration_number: string | null
          business_type: string
          contact_person_name: string
          contact_person_position: string
          created_at: string
          documents: Json | null
          id: string
          notes: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_links: Json | null
          status: Database["public"]["Enums"]["PartnerApplicationStatus"]
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_number?: string
          business_address: string
          business_description?: string | null
          business_email: string
          business_name: string
          business_phone: string
          business_registration_number?: string | null
          business_type: string
          contact_person_name: string
          contact_person_position: string
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["PartnerApplicationStatus"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_number?: string
          business_address?: string
          business_description?: string | null
          business_email?: string
          business_name?: string
          business_phone?: string
          business_registration_number?: string | null
          business_type?: string
          contact_person_name?: string
          contact_person_position?: string
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["PartnerApplicationStatus"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_fees: {
        Row: {
          created_at: string
          delivery_fee_amount: number | null
          delivery_fee_percentage: number | null
          delivery_partner_id: string | null
          delivery_payout_id: string | null
          delivery_transfer_id: string | null
          id: string
          metadata: Json | null
          payment_id: string
          payout_schedule_date: string | null
          platform_fee_amount: number
          platform_fee_percentage: number
          shop_account_id: string | null
          shop_fee_amount: number
          shop_fee_percentage: number
          shop_payout_id: string | null
          shop_transfer_id: string | null
          tax_amount: number | null
          tax_details: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_fee_amount?: number | null
          delivery_fee_percentage?: number | null
          delivery_partner_id?: string | null
          delivery_payout_id?: string | null
          delivery_transfer_id?: string | null
          id?: string
          metadata?: Json | null
          payment_id: string
          payout_schedule_date?: string | null
          platform_fee_amount: number
          platform_fee_percentage: number
          shop_account_id?: string | null
          shop_fee_amount: number
          shop_fee_percentage: number
          shop_payout_id?: string | null
          shop_transfer_id?: string | null
          tax_amount?: number | null
          tax_details?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_fee_amount?: number | null
          delivery_fee_percentage?: number | null
          delivery_partner_id?: string | null
          delivery_payout_id?: string | null
          delivery_transfer_id?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          payout_schedule_date?: string | null
          platform_fee_amount?: number
          platform_fee_percentage?: number
          shop_account_id?: string | null
          shop_fee_amount?: number
          shop_fee_percentage?: number
          shop_payout_id?: string | null
          shop_transfer_id?: string | null
          tax_amount?: number | null
          tax_details?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_fees_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fees_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          archived_at: string | null
          card_brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last4: string | null
          status: Database["public"]["Enums"]["PaymentMethodStatus"]
          stripe_payment_method_id: string
          type: Database["public"]["Enums"]["PaymentMethodType"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          card_brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          status?: Database["public"]["Enums"]["PaymentMethodStatus"]
          stripe_payment_method_id: string
          type: Database["public"]["Enums"]["PaymentMethodType"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          card_brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          status?: Database["public"]["Enums"]["PaymentMethodStatus"]
          stripe_payment_method_id?: string
          type?: Database["public"]["Enums"]["PaymentMethodType"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          delivery_partner_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          p2p_order_id: string | null
          payment_method_id: string
          payment_type: Database["public"]["Enums"]["PaymentType"]
          provider: Database["public"]["Enums"]["PaymentProvider"]
          provider_client_secret: string | null
          provider_payment_id: string | null
          refunded_amount: number | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id: string
          delivery_partner_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          p2p_order_id?: string | null
          payment_method_id: string
          payment_type?: Database["public"]["Enums"]["PaymentType"]
          provider: Database["public"]["Enums"]["PaymentProvider"]
          provider_client_secret?: string | null
          provider_payment_id?: string | null
          refunded_amount?: number | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          delivery_partner_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          p2p_order_id?: string | null
          payment_method_id?: string
          payment_type?: Database["public"]["Enums"]["PaymentType"]
          provider?: Database["public"]["Enums"]["PaymentProvider"]
          provider_client_secret?: string | null
          provider_payment_id?: string | null
          refunded_amount?: number | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_p2p_order_id_fkey"
            columns: ["p2p_order_id"]
            isOneToOne: false
            referencedRelation: "p2p_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_batches: {
        Row: {
          batch_date: string
          created_at: string
          error_count: number
          id: string
          metadata: Json | null
          processed_count: number
          recipient_count: number
          status: Database["public"]["Enums"]["PayoutStatus"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          batch_date: string
          created_at?: string
          error_count?: number
          id?: string
          metadata?: Json | null
          processed_count?: number
          recipient_count: number
          status?: Database["public"]["Enums"]["PayoutStatus"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          batch_date?: string
          created_at?: string
          error_count?: number
          id?: string
          metadata?: Json | null
          processed_count?: number
          recipient_count?: number
          status?: Database["public"]["Enums"]["PayoutStatus"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_likes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          available_sizes: string[] | null
          colors: string[] | null
          created_at: string | null
          height: string | null
          id: string
          length: string | null
          materials: string[] | null
          product_id: string
          updated_at: string | null
          width: string | null
        }
        Insert: {
          available_sizes?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          height?: string | null
          id?: string
          length?: string | null
          materials?: string[] | null
          product_id: string
          updated_at?: string | null
          width?: string | null
        }
        Update: {
          available_sizes?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          height?: string | null
          id?: string
          length?: string | null
          materials?: string[] | null
          product_id?: string
          updated_at?: string | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["ProductCategory"]
          cost_price: number | null
          created_at: string | null
          description: string | null
          gender: Database["public"]["Enums"]["ProductGender"]
          id: string
          images: Json | null
          is_available: boolean | null
          low_stock_threshold: number | null
          name: string
          price: number
          sale_price: number | null
          shop_id: string | null
          sku: string | null
          stock_quantity: number
          subcategory: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["ProductCategory"]
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["ProductGender"]
          id?: string
          images?: Json | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          name: string
          price: number
          sale_price?: number | null
          shop_id?: string | null
          sku?: string | null
          stock_quantity?: number
          subcategory: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["ProductCategory"]
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["ProductGender"]
          id?: string
          images?: Json | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          price?: number
          sale_price?: number | null
          shop_id?: string | null
          sku?: string | null
          stock_quantity?: number
          subcategory?: string
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
      shops: {
        Row: {
          address: string
          business_hours: Json | null
          coordinates: Json | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_completed: boolean
          owner_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["ShopStatus"]
          stripe_account_id: string | null
          stripe_account_status:
            | Database["public"]["Enums"]["StripeAccountStatus"]
            | null
          updated_at: string | null
        }
        Insert: {
          address: string
          business_hours?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["ShopStatus"]
          stripe_account_id?: string | null
          stripe_account_status?:
            | Database["public"]["Enums"]["StripeAccountStatus"]
            | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_hours?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["ShopStatus"]
          stripe_account_id?: string | null
          stripe_account_status?:
            | Database["public"]["Enums"]["StripeAccountStatus"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          assigned_from: string | null
          assigned_to: string | null
          changed_at: string
          changed_by: string
          id: string
          notes: string | null
          priority_from: Database["public"]["Enums"]["TaskPriority"] | null
          priority_to: Database["public"]["Enums"]["TaskPriority"] | null
          status_from: Database["public"]["Enums"]["TaskStatus"] | null
          status_to: Database["public"]["Enums"]["TaskStatus"] | null
          task_id: string
        }
        Insert: {
          assigned_from?: string | null
          assigned_to?: string | null
          changed_at?: string
          changed_by: string
          id?: string
          notes?: string | null
          priority_from?: Database["public"]["Enums"]["TaskPriority"] | null
          priority_to?: Database["public"]["Enums"]["TaskPriority"] | null
          status_from?: Database["public"]["Enums"]["TaskStatus"] | null
          status_to?: Database["public"]["Enums"]["TaskStatus"] | null
          task_id: string
        }
        Update: {
          assigned_from?: string | null
          assigned_to?: string | null
          changed_at?: string
          changed_by?: string
          id?: string
          notes?: string | null
          priority_from?: Database["public"]["Enums"]["TaskPriority"] | null
          priority_to?: Database["public"]["Enums"]["TaskPriority"] | null
          status_from?: Database["public"]["Enums"]["TaskStatus"] | null
          status_to?: Database["public"]["Enums"]["TaskStatus"] | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_assigned_from_fkey"
            columns: ["assigned_from"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description_template: string | null
          id: string
          is_system_template: boolean
          label: Database["public"]["Enums"]["TaskLabel"]
          metadata_template: Json | null
          priority: Database["public"]["Enums"]["TaskPriority"]
          task_type: string
          title_template: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_template?: string | null
          id?: string
          is_system_template?: boolean
          label: Database["public"]["Enums"]["TaskLabel"]
          metadata_template?: Json | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          task_type: string
          title_template: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_template?: string | null
          id?: string
          is_system_template?: boolean
          label?: Database["public"]["Enums"]["TaskLabel"]
          metadata_template?: Json | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          task_type?: string
          title_template?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          label: Database["public"]["Enums"]["TaskLabel"]
          metadata: Json | null
          priority: Database["public"]["Enums"]["TaskPriority"]
          related_delivery_id: string | null
          related_order_id: string | null
          related_shop_id: string | null
          status: Database["public"]["Enums"]["TaskStatus"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          label: Database["public"]["Enums"]["TaskLabel"]
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          related_delivery_id?: string | null
          related_order_id?: string | null
          related_shop_id?: string | null
          status?: Database["public"]["Enums"]["TaskStatus"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          label?: Database["public"]["Enums"]["TaskLabel"]
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          related_delivery_id?: string | null
          related_order_id?: string | null
          related_shop_id?: string | null
          status?: Database["public"]["Enums"]["TaskStatus"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_delivery_id_fkey"
            columns: ["related_delivery_id"]
            isOneToOne: false
            referencedRelation: "delivery_partner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_shop_id_fkey"
            columns: ["related_shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_id: string | null
          provider: Database["public"]["Enums"]["PaymentProvider"]
          provider_tx_id: string | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          provider?: Database["public"]["Enums"]["PaymentProvider"]
          provider_tx_id?: string | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          provider?: Database["public"]["Enums"]["PaymentProvider"]
          provider_tx_id?: string | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          type?: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_item_offers: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          item_id: string
          message: string | null
          offer_amount: number
          status: Database["public"]["Enums"]["OfferStatus"]
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          item_id: string
          message?: string | null
          offer_amount: number
          status?: Database["public"]["Enums"]["OfferStatus"]
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          message?: string | null
          offer_amount?: number
          status?: Database["public"]["Enums"]["OfferStatus"]
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_item_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_item_offers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_items: {
        Row: {
          brand: string | null
          color: string | null
          condition: Database["public"]["Enums"]["ItemCondition"]
          created_at: string | null
          description: string | null
          height: string | null
          id: string
          images: Json | null
          is_negotiable: boolean | null
          length: string | null
          location: Json | null
          materials: string[] | null
          name: string
          price: number
          seller_id: string
          size: string | null
          status: Database["public"]["Enums"]["ItemStatus"]
          updated_at: string | null
          width: string | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          condition: Database["public"]["Enums"]["ItemCondition"]
          created_at?: string | null
          description?: string | null
          height?: string | null
          id?: string
          images?: Json | null
          is_negotiable?: boolean | null
          length?: string | null
          location?: Json | null
          materials?: string[] | null
          name: string
          price: number
          seller_id: string
          size?: string | null
          status?: Database["public"]["Enums"]["ItemStatus"]
          updated_at?: string | null
          width?: string | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          condition?: Database["public"]["Enums"]["ItemCondition"]
          created_at?: string | null
          description?: string | null
          height?: string | null
          id?: string
          images?: Json | null
          is_negotiable?: boolean | null
          length?: string | null
          location?: Json | null
          materials?: string[] | null
          name?: string
          price?: number
          seller_id?: string
          size?: string | null
          status?: Database["public"]["Enums"]["ItemStatus"]
          updated_at?: string | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          bio: string | null
          created_at: string
          display_email: boolean
          display_phone: boolean
          id: string
          is_public: boolean
          location: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_email?: boolean
          display_phone?: boolean
          id: string
          is_public?: boolean
          location?: string | null
          social_links?: Json | null
          updated_at: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_email?: boolean
          display_phone?: boolean
          id?: string
          is_public?: boolean
          location?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          email: string | null
          expo_push_token: string | null
          full_name: string | null
          id: string
          is_push_notification: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["UserRole"]
          stripe_customer_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          expo_push_token?: string | null
          full_name?: string | null
          id: string
          is_push_notification?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          stripe_customer_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          expo_push_token?: string | null
          full_name?: string | null
          id?: string
          is_push_notification?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_payment_event: {
        Args: {
          event_type: string
          payment_id: string
          details: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      ChatConversationStatus: "ACTIVE" | "ARCHIVED" | "BLOCKED"
      ChatMessageType: "TEXT" | "IMAGE" | "OFFER" | "PENDING_PAYMENT"
      DeliveryMethod: "SHIPPING" | "LOCAL_PICKUP"
      DeliveryPartnerApplicationStatus:
        | "DRAFT"
        | "SUBMITTED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
      DeliveryPartnerStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED"
      ItemCondition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR"
      ItemStatus: "DRAFT" | "PUBLISHED" | "SOLD" | "ARCHIVED"
      OfferStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "WITHDRAWN"
      OrderEventStatus:
        | "ORDER_PLACED"
        | "PAYMENT_PENDING"
        | "PAYMENT_COMPLETED"
        | "ORDER_CONFIRMED"
        | "PREPARATION_STARTED"
        | "READY_FOR_PICKUP"
        | "PICKUP_COMPLETED"
        | "OUT_FOR_DELIVERY"
        | "DELIVERY_ATTEMPTED"
        | "DELIVERED"
        | "CANCELLED"
        | "REFUND_REQUESTED"
        | "REFUND_PROCESSED"
      OrderStatus:
        | "PENDING"
        | "CONFIRMED"
        | "PREPARING"
        | "READY_FOR_PICKUP"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "CANCELLED"
        | "REFUNDED"
      P2POrderStatus:
        | "PENDING_PAYMENT"
        | "PAYMENT_CONFIRMED"
        | "READY_FOR_PICKUP"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "CANCELLED"
      PartnerApplicationStatus:
        | "DRAFT"
        | "SUBMITTED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
      PaymentMethodStatus: "ACTIVE" | "ARCHIVED" | "EXPIRED"
      PaymentMethodType: "CARD" | "IDEAL" | "BANCONTACT"
      PaymentProvider: "STRIPE" | "PAYPAL" | "BANK_TRANSFER" | "OTHER"
      PaymentStatus:
        | "PENDING"
        | "PROCESSING"
        | "SUCCEEDED"
        | "FAILED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED"
      PaymentType:
        | "SHOP_ORDER"
        | "P2P_ORDER"
        | "REFUND"
        | "PAYOUT"
        | "ADJUSTMENT"
      PayoutStatus: "PENDING" | "IN_TRANSIT" | "PAID" | "FAILED" | "CANCELED"
      ProductCategory:
        | "CLOTHING"
        | "SHOES"
        | "ACCESSORIES"
        | "DESIGNER"
        | "STREETWEAR"
        | "SPORTS"
      ProductGender: "MEN" | "WOMEN" | "UNISEX" | "KIDS"
      ShopStatus: "PENDING" | "ACTIVE" | "SUSPENDED"
      StripeAccountStatus:
        | "PENDING"
        | "ACTIVE"
        | "DEAUTHORIZED"
        | "UPDATED"
        | "RESTRICTED"
      TaskLabel:
        | "SHOP_MANAGEMENT"
        | "ORDER_MANAGEMENT"
        | "DELIVERY_MANAGEMENT"
        | "CUSTOMER_SERVICE"
        | "PLATFORM_ISSUE"
        | "SUPPORT"
        | "INVENTORY"
        | "BUG"
        | "FEATURE"
        | "USER_MANAGEMENT"
        | "NEW_ORDER"
        | "DELIVERY_PICKUP"
        | "DELIVERY_ISSUE"
      TaskPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      TaskStatus: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED"
      TransactionType:
        | "CHARGE"
        | "REFUND"
        | "PAYOUT"
        | "PAYOUT_REVERSAL"
        | "FEE"
        | "ADJUSTMENT"
      TransferStatus:
        | "PENDING"
        | "PROCESSING"
        | "SUCCEEDED"
        | "FAILED"
        | "REVERSED"
      UserRole:
        | "CUSTOMER"
        | "SHOP_OWNER"
        | "DELIVERY_PARTNER"
        | "INTERNAL_OPERATOR"
        | "ADMIN"
        | "SUPER_ADMIN"
      VehicleType: "BICYCLE" | "MOTORCYCLE" | "CAR" | "VAN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
