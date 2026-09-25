CREATE TABLE "public"."items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "household_id" uuid NOT NULL,
  "name" text NOT NULL,
  "icon_name" text,
  "location" text,
  "base_unit_label" text NOT NULL,
  "base_unit_value" numeric NOT NULL,
  CONSTRAINT "items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT "items_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."items"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household access for items" ON "public"."items"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."items" TO "anon", "authenticated", "postgres", "service_role";
