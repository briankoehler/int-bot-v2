CREATE OR REPLACE FUNCTION public.notify_insert_stats()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM pg_notify('new_stats_event', row_to_json(NEW)::text);
    RETURN NULL;
END;
$function$
