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
select createFlowBox (2,'caja de flujo 2', 'sam ra,pm', 'lat prueba, long prueba');
select createFlowReport(1);

delete from fsensor
select addFSensor(1,8,432.54,12355.00);
select addFSensor(2,8,453543.63,12355.01);
select addFSensor(3,8,1324.78,12355.02);
select addFSensor(4,8,65465.90,65465.03);
select addFSensor(5,8,1234.31,1234.04);

select createRelayState();
select * from relays
select addRelay(2,1,TRUE);
select addRelay(2,2,FALSE);
select addRelay(3,TRUE);
select addRelay(4,FALSE);
select addRelay(5,TRUE);

select createHumidityBox ('A','primera caja de flujo', 'Heredia', 'latlong prueba');

select createHumidityReport('A');

delete from flowBox;
delete from flowReport;

delete from humiditybox;
delete from humidityreport;
delete from hsensor

select addHSensor (37,1,123.54321,123.50);
select addHSensor (37,2,123.959,123.0);
select addHSensor (37,3,123.54,123.50);
select addHSensor (37,4,123.001,123.41);
select addHSensor (37,5,123.99,124);

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


