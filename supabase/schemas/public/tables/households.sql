CREATE TABLE "public"."households" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  CONSTRAINT "households_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."households"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own household" ON "public"."households"
  FOR SELECT
  TO PUBLIC
  USING ((id = public.get_user_household_id()));

CREATE POLICY "Users can update their own household" ON "public"."households"
  FOR UPDATE
  TO PUBLIC
  USING ((id = public.get_user_household_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."households" TO "anon", "authenticated", "postgres", "service_role";
