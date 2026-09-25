CREATE TABLE "public"."profiles" (
  "id"         uuid                     NOT NULL,
  "updated_at" timestamp with time zone,
  "username"   text,
  "full_name"  text,
  "avatar_url" text,
  "website"    text,
  "household_id" uuid,
  CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "profiles_household_id_fkey" FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_username_key" UNIQUE (username),
  CONSTRAINT "username_length" CHECK ((char_length(username) >= 3))
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their household" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((id = auth.uid() OR household_id = public.get_user_household_id()));

CREATE POLICY "Users can insert their own profile." ON "public"."profiles"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "Users can update own profile." ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((( SELECT auth.uid() AS uid) = id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";
