CREATE TABLE "public"."stores" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "household_id" uuid NOT NULL,
  "name" text NOT NULL,
  CONSTRAINT "stores_household_id_fkey" FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT "stores_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."stores"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household access for stores" ON "public"."stores"
  FOR ALL
  TO PUBLIC
  USING ((household_id = public.get_user_household_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stores" TO "anon", "authenticated", "postgres", "service_role";
