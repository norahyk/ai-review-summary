CREATE TABLE "public"."purchase_records" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "household_id" uuid NOT NULL,
  "brand_id" uuid NOT NULL,
  "store_id" uuid NOT NULL,
  "purchase_date" date DEFAULT CURRENT_DATE NOT NULL,
  "price_without_tax" integer NOT NULL,
  "content_amount" numeric NOT NULL,
  "unit_price" numeric NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "purchase_records_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  CONSTRAINT "purchase_records_household_id_fkey" FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT "purchase_records_store_id_fkey" FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT "purchase_records_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."purchase_records"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household access for purchase_records" ON "public"."purchase_records"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."purchase_records" TO "anon", "authenticated", "postgres", "service_role";
