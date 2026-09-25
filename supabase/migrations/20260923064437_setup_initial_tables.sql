SET local check_function_bodies = off;

DROP POLICY "Public profiles are viewable by everyone." ON "public"."profiles";

CREATE TABLE "public"."brands" (
  "id"      uuid NOT NULL DEFAULT gen_random_uuid(),
  "item_id" uuid NOT NULL,
  "name"    text NOT NULL,
  CONSTRAINT "brands_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."brands"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."households" (
  "id"   uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  CONSTRAINT "households_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."households"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."items" (
  "id"           uuid NOT NULL DEFAULT gen_random_uuid(),
  "household_id" uuid NOT NULL,
  "name"         text NOT NULL,
  CONSTRAINT "items_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."products" (
  "id"              uuid    NOT NULL DEFAULT gen_random_uuid(),
  "brand_id"        uuid    NOT NULL,
  "base_unit_label" text    NOT NULL,
  "base_unit_value" numeric NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."products"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."purchase_records" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "household_id"      uuid                     NOT NULL,
  "product_id"        uuid                     NOT NULL,
  "store_id"          uuid                     NOT NULL,
  "purchase_date"     date                     NOT NULL DEFAULT CURRENT_DATE,
  "price_without_tax" integer                  NOT NULL,
  "content_amount"    numeric                  NOT NULL,
  "unit_price"        numeric                  NOT NULL,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "purchase_records_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."purchase_records"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."stores" (
  "id"           uuid NOT NULL DEFAULT gen_random_uuid(),
  "household_id" uuid NOT NULL,
  "name"         text NOT NULL,
  CONSTRAINT "stores_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."stores"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_settings" (
  "user_id"                   uuid NOT NULL,
  "primary_comparison_metric" text DEFAULT 'LATEST'::text,
  CONSTRAINT "user_settings_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."user_settings"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles"
  ADD COLUMN "household_id" uuid;

CREATE OR REPLACE FUNCTION public.get_user_household_id()
  RETURNS uuid
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT household_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  new_household_id uuid;
begin
  -- 1. 新しいHouseholdを作成
  INSERT INTO public.households (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Household'))
  RETURNING id INTO new_household_id;

  -- 2. プロフィールを作成し、Householdに紐付ける
  insert into public.profiles (id, full_name, avatar_url, household_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new_household_id);

  -- 3. デフォルトの設定を作成
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  return new;
end;
$function$;

ALTER TABLE "public"."items"
  ADD CONSTRAINT "items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE CASCADE;

ALTER TABLE "public"."brands"
  ADD CONSTRAINT "brands_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE SET NULL;

ALTER TABLE "public"."purchase_records"
  ADD CONSTRAINT "purchase_records_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE CASCADE;

ALTER TABLE "public"."purchase_records"
  ADD CONSTRAINT "purchase_records_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE "public"."stores"
  ADD CONSTRAINT "stores_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE CASCADE;

ALTER TABLE "public"."purchase_records"
  ADD CONSTRAINT "purchase_records_store_id_fkey" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_settings"
  ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE POLICY "Household access for brands" ON "public"."brands"
  FOR ALL
  TO PUBLIC
  USING ((item_id IN ( SELECT items.id
   FROM public.items
  WHERE (items.household_id = public.get_user_household_id()))));

CREATE POLICY "Users can update their own household" ON "public"."households"
  FOR UPDATE
  TO PUBLIC
  USING ((id = public.get_user_household_id()));

CREATE POLICY "Users can view their own household" ON "public"."households"
  FOR SELECT
  TO PUBLIC
  USING ((id = public.get_user_household_id()));

CREATE POLICY "Household access for items" ON "public"."items"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

CREATE POLICY "Household access for products" ON "public"."products"
  FOR ALL
  TO PUBLIC
  USING ((brand_id IN ( SELECT b.id
   FROM (public.brands b
     JOIN public.items i ON ((b.item_id = i.id)))
  WHERE (i.household_id = public.get_user_household_id()))));

CREATE POLICY "Users can view profiles in their household" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING (((id = auth.uid()) OR (household_id = public.get_user_household_id())));

CREATE POLICY "Household access for purchase_records" ON "public"."purchase_records"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

CREATE POLICY "Household access for stores" ON "public"."stores"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

CREATE POLICY "Users can update own settings" ON "public"."user_settings"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can view own settings" ON "public"."user_settings"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT EXECUTE ON FUNCTION "public"."get_user_household_id"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."brands" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."households" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."items" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."products" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."purchase_records" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stores" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_settings" TO "anon", "authenticated", "postgres", "service_role";
