ALTER TABLE "public"."products"
  DROP CONSTRAINT "products_brand_id_fkey";

ALTER TABLE "public"."purchase_records"
  DROP CONSTRAINT "purchase_records_product_id_fkey";

ALTER TABLE "public"."purchase_records"
  DROP COLUMN "product_id";

DROP TABLE "public"."products";

ALTER TABLE "public"."items"
  ADD COLUMN "base_unit_label" text NOT NULL;

ALTER TABLE "public"."items"
  ADD COLUMN "base_unit_value" numeric NOT NULL;

ALTER TABLE "public"."purchase_records"
  ADD COLUMN "brand_id" uuid NOT NULL;

ALTER TABLE "public"."purchase_records"
  ADD CONSTRAINT "purchase_records_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
