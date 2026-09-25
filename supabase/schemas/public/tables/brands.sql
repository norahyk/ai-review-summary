CREATE TABLE "public"."brands" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid NOT NULL,
  "name" text NOT NULL,
  "package_type" text,
  CONSTRAINT "brands_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT "brands_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."brands"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household access for brands" ON "public"."brands"
  FOR ALL
  TO PUBLIC
  USING ((item_id IN ( SELECT items.id
   FROM items
  WHERE (items.household_id = public.get_user_household_id()))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."brands" TO "anon", "authenticated", "postgres", "service_role";
