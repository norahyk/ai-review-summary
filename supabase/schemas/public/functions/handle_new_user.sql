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

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
