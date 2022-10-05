--*****Triggers Flow Report*****
CREATE OR REPLACE Function check_timeVector() returns trigger as $$
    DECLARE
		--gets the date and time rounded to the nearest 5 minutes
		timeNow TIMESTAMP;
	BEGIN
		--if the time vector exists, assign its id to the report
		SELECT into timeNow date_trunc('hour', CURRENT_TIMESTAMP) + interval '5 min' * round(date_part('minute', CURRENT_TIMESTAMP) / 5.0);
		
		--In case the time vector doesn't exists, create a new one
		IF not exists (select dateTime from timeVector where dateTime = timeNow) THEN
			insert into timeVector(dateTime)
			values (timeNow);
		End if;
		NEW.idTimeVector := (select timeVector.idTime from timeVector where dateTime = timeNow);
		Return NEW;
	END;
$$ LANGUAGE plpgsql;

Create or replace Trigger manageTimeVector before insert on FlowReport
for each row
execute procedure check_timeVector();

--Pruebas


select 


