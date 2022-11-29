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
Create Trigger manageTimeVector before insert on FlowReport
for each row
execute procedure check_timeVector();

--*****Triggers Relay State*****
Create Trigger manageTimeVector before insert on RelayState
for each row
execute procedure check_timeVector();

--*****Triggers HumidityReport
Create Trigger manageTimeVector before insert on HumidityReport
for each row
execute procedure check_timeVector();

--*****Triggers Temperature Register*****
Create Trigger manageTimeVector before insert on TemperatureRegister
for each row
execute procedure check_timeVector();

/*Pruebas
select createFlowBox (1,'caja de flujo', 'limon', 'lat prueba, long prueba');
select createFlowReport(1);
select * from flowreport;
select * from fsensor;
delete from fsensor
select addFSensor(6,1,12345.54,12355.00);
select addFSensor(6,2,12345.63,12355.01);
select addFSensor(6,3,12345.78,12355.02);
select addFSensor(5,4,12345.90,12355.03);
select addFSensor(5,5,12345.31,12355.04);

select createRelayState();

select addRelay(1,TRUE);
select addRelay(2,FALSE);
select addRelay(3,TRUE);
select addRelay(4,FALSE);
select addRelay(5,TRUE);

select createHumidityBox ('B','segunda caja de flujo', 'Heredia', 'latlong prueba');

select createHumidityReport('B');

delete from flowBox;
delete from flowReport;

select addHSensor (8,1,56.54321,56.50000);
select addHSensor (8,2,108.959,109.0);
select addHSensor (8,3,12345.54321,12355.50000);
select addHSensor (9,4,540.001,450.0);
select addHSensor (9,5,1010.9999,1011.000);

select createTemperatureRegister();

select addTemperature (1, 2, 90.5);
select addTemperature (1, 3, 90.5);
select addTemperature (2, 2, 35.4);


select * from flowbox;
select * from flowreport; 
select * from timeVector;
select * from FSensor;
select * from RelayState;
select * from Relays;

select * from HumidityBox;
select * from HumidityReport;
select * from HSensor;

select * from temperatureregister;
select * from temperatures;

*/


