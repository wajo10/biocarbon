--*****Triggers Flow Report*****
--Corregir este trigger
CREATE OR REPLACE Function check_timeVector()returns trigger as $$
    DECLARE
		--gets the date and time rounded to the nearest 5 minutes
		timeNow TIMESTAMP := SELECT date_trunc('hour', CURRENT_TIMESTAMP) + interval '5 min' * round(date_part('minute', CURRENT_TIMESTAMP) / 5.0) 
	BEGIN
		IF exists (select dateTime from timeVector where dateTime = timeNow) THEN
			update flowreport
			set new.timeVector = timeNow
		End if;
	END;
$$ LANGUAGE plpgsql;
	