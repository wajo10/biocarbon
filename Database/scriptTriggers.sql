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

--*****Triggers HumidityReport
Create or replace Trigger manageTimeVector before insert on HumidityReport
for each row
execute procedure check_timeVector();

--*****Triggers Temperature Register*****
Create or replace Trigger manageTimeVector before insert on TemperatureRegister
for each row
execute procedure check_timeVector();

/*Pruebas
select createFlowBox ('segunda caja de flujo', 'limon');
select createFlowReport('Caja de flujo prueba 2');
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

select createHumidityBox ('primera caja de flujo', 'Heredia');
select createHumidityBox ('segunda caja de flujo', 'Guanacaste');

select createHumidityReport('primera caja de flujo');
select createHumidityReport('segunda caja de flujo');

select addHSensor (1,56.54321,56.50000);
select addHSensor (2,108.959,109.0);
select addHSensor (3,12345.54321,12355.50000);
select addHSensor (4,540.001,450.0);
select addHSensor (5,1010.9999,1011.000);

select createTemperatureState();

select addTemperature (1, 90.5);
select addTemperature (2, 35.4);
select addTemperature (3, 55.7);
select addTemperature (4, 27.1);
select addTemperature (5, 19.8);

;

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


delete from FlowReport where idfreport = 5;
delete from timeVector where idTime = 26;

*/


