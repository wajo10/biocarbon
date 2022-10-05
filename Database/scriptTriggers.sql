--Function that is activated by triggers to manage the time vector table
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

--*****Triggers Flow Report*****
Create or replace Trigger manageTimeVector before insert on FlowReport
for each row
execute procedure check_timeVector();

--*****Triggers Relay State*****
Create or replace Trigger manageTimeVector before insert on RelayState
for each row
execute procedure check_timeVector();
/*Pruebas
select createFlowBox ('segunda caja de flujo', 'limon');
select createFlowReport('Caja de flujo prueba');
select createFlowReport('segunda caja de flujo');

select addFSensor(6,12345.54321,12355.50000);
select addFSensor(7,12345.54321,12355.50000);
select addFSensor(8,12345.54321,12355.50000);
select addFSensor(9,12345.54321,12355.50000);
select addFSensor(10,12345.54321,12355.50000)

select createRelayState();

select addRelay(1,TRUE);
select addRelay(2,FALSE);
select addRelay(3,TRUE);
select addRelay(4,FALSE);
select addRelay(5,TRUE);


;

select * from flowbox;
select * from flowreport; 
select * from timeVector;
select * from FSensor;
select * from RelayState;
select * from Relays;

delete from FlowReport where idfreport = 5;
delete from timeVector where idTime = 26;

*/


