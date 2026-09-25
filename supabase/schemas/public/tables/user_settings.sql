CREATE TABLE "public"."user_settings" (
  "user_id" uuid NOT NULL,
  "primary_comparison_metric" text DEFAULT 'LATEST'::text,
  CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT "user_settings_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."user_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON "public"."user_settings"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can update own settings" ON "public"."user_settings"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_settings" TO "anon", "authenticated", "postgres", "service_role";
