CREATE TRIGGER updated_stats_trigger AFTER INSERT ON summoner_stats
FOR EACH ROW EXECUTE PROCEDURE notify_insert_stats();