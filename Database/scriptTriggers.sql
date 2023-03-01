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

select createHumidityReport('A',true);

select * from HumidityReport

delete from flowBox;
delete from flowReport;

delete from humiditybox;
delete from humidityreport;
delete from hsensor where idHreport = 7

select addHSensor (10,1,1000.54321,123.50);
select addHSensor (10,2,1000.959,123.0);
select addHSensor (10,3,1000.54,123.50);
select addHSensor (10,4,1000.001,123.41);
select addHSensor (10,5,1000.99,124);

select createTemperatureRegister();

select addTemperature (2, 1, 12.5);
select addTemperature (2, 2, 22.5);
select addTemperature (2, 3, 32.4);

select getTemperatures(2)


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

select * from timeVector

select * from obtenerSensoresReporte('A','2023-02-15 22:28:00','2023-02-15 22:31:00',true)
*/


