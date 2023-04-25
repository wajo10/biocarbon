--*****User table*****
--Create new user
CREATE OR REPLACE FUNCTION createUser (user_name varchar(30), name_user varchar(40), first_LastName varchar(20), second_LastName varchar (20),
									   email_user varchar (50), password_user varchar, phone_Number varchar (20)) RETURNS void AS $$
Declare
EncodedPassword varchar;
Begin
SELECT crypt(password_user, gen_salt('bf', 4)) into EncodedPassword;
insert into users (username, name, firstLastName, secondLastName, email, password, phoneNumber)
values (user_name, name_user, first_LastName, second_LastName, email_user, EncodedPassword, phone_Number);
END;
$$ LANGUAGE plpgsql;

--validate user
CREATE OR REPLACE FUNCTION validateUser(UserName_r varchar, Password_r varchar) RETURNS Users AS 
	$$
	(SELECT * FROM USERS WHERE UserName_r = UserName and Password = crypt(Password_r, Password))
	$$
Language SQL;

--modify user
CREATE OR REPLACE FUNCTION modifyUser (UserName_r varchar, Name_r varchar, FirstLastName_r varchar, SecondLastName_r varchar, Email_r varchar, PhoneNumber_r varchar,
										 Password_r varchar) RETURNS void AS $$
	DECLARE
		EncodedPassword VARCHAR;
	BEGIN
		SELECT crypt(Password_r, gen_salt('bf', 4)) into EncodedPassword;
	UPDATE users
	SET UserName = UserName_r, Name = Name_r, FirstLastName = FirstLastName_r, SecondLastName = SecondLastName_r, Email = Email_r, PhoneNumber = PhoneNumber_r, Password = EncodedPassword
	WHERE UserName = UserName_r;
	END;
	$$
LANGUAGE plpgsql;

--*****Flow Box table*****

--creates a new flow box
CREATE OR REPLACE FUNCTION createFlowBox (box_id integer, box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
insert into FlowBox (idFlowBox, name, location, latlong)
values (box_id, box_Name, box_location, box_latlong);
$$ LANGUAGE sql;

--Update the location of a flow box
CREATE OR REPLACE FUNCTION updateFBoxLocation (box_id integer, box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
update FlowBox
set location = box_location, latlong = box_latlong
where idFlowBox = box_id
$$ LANGUAGE sql;

--Get flow box data by id
CREATE OR REPLACE FUNCTION getFlowBox(idBox_r INT) RETURNS FlowBox AS
	$$
	SELECT * FROM FlowBox WHERE 
	idFlowBox = idBox_r
	$$
LANGUAGE SQL;

--Get all flow boxes data
CREATE OR REPLACE FUNCTION getFlowBoxes() RETURNS setof FlowBox AS
	$$
	SELECT * FROM FlowBox
	$$
LANGUAGE SQL;

--*****Flow Report table*****

--creates a new flow report 
CREATE OR REPLACE FUNCTION createFlowReport (id_FlowBox integer, calibrated boolean) RETURNS integer AS $$
Declare
	idReport int;
Begin
	insert into FlowReport (idFlowBox,date, iscalibrated)
	values (id_FlowBox, CURRENT_TIMESTAMP, calibrated);
	select (select idFReport from FlowReport order by date desc limit 1) into idReport;
	return idReport;
END;
$$ LANGUAGE plpgsql;

--get data from a flow report by box id 
CREATE OR REPLACE FUNCTION lastFlowReport (idBox_r INT) returns table(idFReport int, ActualDate timestamp, vectorDate timestamp, 
																	  idFBox int, idTime int, calibrated boolean) AS 
	$$
	select f.idFReport, f.date, t_v.dateTime, f.idflowbox, t_v.idTime, f.iscalibrated from FlowReport as f
	inner join timeVector as t_v on F.idtimevector = t_v.idtime
	inner join FlowBox as f_b on f_b.idFlowBox = f.idflowbox
	where f_b.idFlowBox = idBox_r
	order by f.date desc limit 1;
	$$
LANGUAGE SQL;

--get sensor data by box id of the last 5 lectures
CREATE OR REPLACE FUNCTION lastFlowReportSensors (idBox_r INT) returns table(sensorNumber int, raw decimal(10,2), interp decimal(10,2)) AS 
	$$
	select fse.sensorNumber, fse.rawValue, fse.ValueInterp from FSensor as fse 
	inner join FlowReport as fr on fse.idFReport = fr.idFReport
	inner join FlowBox as fbox on fbox.idFlowBox = fr.idFlowBox
	where fbox.idFlowBox = idBox_r
	order by fr.date desc limit 5;
	$$
LANGUAGE SQL;

--*****Flow Sensors*****

--adds a new sensor entry to the last flow report created
CREATE OR REPLACE FUNCTION addFSensor (sensor_number integer, idFlowReport integer, raw_value decimal(10,2), value_interp decimal(10,2)) RETURNS void AS $$
Begin
	insert into FSensor(sensorNumber,idFReport,rawValue,valueInterp)
	values (sensor_number,idFlowReport,raw_value,value_interp);
END;
$$ LANGUAGE plpgsql;

--*****Relays State*****

--creates a new relay state report
CREATE OR REPLACE FUNCTION createRelayState() RETURNS integer AS $$
Declare
	idRelay int;
Begin
	insert into RelayState (date)
	values (current_timestamp);
		select (select idRelayState from RelayState order by date desc limit 1) into idRelay;
	return idRelay;
END;
$$ LANGUAGE plpgsql;

--*****Relays*****

--adds a new relay entry to the last relay state created
CREATE OR REPLACE FUNCTION addRelay (idRelay_state integer, relay_number int, relay_state boolean) RETURNS void AS $$
Begin
	insert into Relays(relayNumber, idRelayState, state)
	values (relay_number, idRelay_state, relay_state);
END;
$$ LANGUAGE plpgsql;

--*****Humidity Box*****

--Create a new Humidity Box
CREATE OR REPLACE FUNCTION createHumidityBox (idHumBox varchar(2), box_Name varchar(50), box_location varchar(50), box_latlong varchar (50)) RETURNS void AS $$
insert into HumidityBox (idhumiditybox,name, location, latlong)
values (idHumBox, box_Name, box_location, box_latlong);
$$ LANGUAGE sql;

--Update the location of a Humidity Box
CREATE OR REPLACE FUNCTION updateHBoxLocation (box_id varchar(2), box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
update HumidityBox
set location = box_location, latlong = box_latlong, name = box_Name
where idHumidityBox = box_id
$$ LANGUAGE sql;

--Get Humidity box data by id
CREATE OR REPLACE FUNCTION getHumidityBox(idBox_r VARCHAR) RETURNS HumidityBox AS
	$$
	SELECT * FROM HumidityBox WHERE 
	idHumidityBox = idBox_r
	$$
LANGUAGE SQL;

--Get all humidity boxes data
CREATE OR REPLACE FUNCTION getHumidityBoxes() RETURNS setof HumidityBox AS
	$$
	SELECT * FROM HumidityBox
	$$
LANGUAGE SQL;


--*****Humidity Report*****

--Create a new humidity report
CREATE OR REPLACE FUNCTION createHumidityReport (box_id varchar(2), calibrated boolean) RETURNS int AS $$
DECLARE
	idReport integer;
Begin
	insert into HumidityReport (idhumiditybox,date, iscalibrated)
	values (box_id, CURRENT_TIMESTAMP, calibrated);
	select (select idHReport from HumidityReport order by date desc limit 1) into idReport;
	return idReport;
END;
$$ LANGUAGE plpgsql;


--get data from a humidity report by box id 
CREATE OR REPLACE FUNCTION lastHumidityReport (idBox_r varchar(2)) returns table(idHReport int, ActualDate timestamp, vectorDate timestamp, 
																	  idHBox varchar(2), idTime int, calibrated boolean) AS 
	$$
	select hr.idHReport, hr.date, t_v.dateTime, hr.idhumiditybox, t_v.idTime, hr.iscalibrated from HumidityReport as hr
	inner join timeVector as t_v on hr.idtimevector = t_v.idtime
	inner join HumidityBox as h_b on h_b.idHumidityBox = hr.idhumiditybox
	where h_b.idHumidityBox = idBox_r
	order by hr.date desc limit 1;
	$$
LANGUAGE SQL;

--GET LAST REPORT
CREATE OR REPLACE FUNCTION latestHumReport() returns HumidityReport AS
	$$
	select * from humidityreport where iscalibrated = false order by date desc limit 1
	$$
LANGUAGE SQL;

--get data from the last 10 humidity reports by box id
CREATE OR REPLACE FUNCTION lastTenHumidityReport (idBox_r varchar(2)) returns table(idHReport int, ActualDate timestamp, vectorDate timestamp, 
																	  idHBox varchar(2), idTime int, calibrated boolean) AS 
	$$
	select hr.idHReport, hr.date, t_v.dateTime, hr.idhumiditybox, t_v.idTime, hr.iscalibrated from HumidityReport as hr
	inner join timeVector as t_v on hr.idtimevector = t_v.idtime
	inner join HumidityBox as h_b on h_b.idHumidityBox = hr.idhumiditybox
	where h_b.idHumidityBox = idBox_r
	order by hr.date desc limit 10;
	$$
LANGUAGE SQL;

--get sensor data by box id of the last 5 lectures
CREATE OR REPLACE FUNCTION lastHumidityReportSensors (idBox_r varchar(2)) returns table(sensorNumber int, raw decimal(10,2), interp decimal(10,2), reportID int) AS 
	$$
	select hse.sensorNumber, hse.rawValue, hse.ValueInterp, hr.idHReport from HSensor as hse 
	inner join HumidityReport as hr on hse.idHReport = hr.idHreport
	inner join HumidityBox as hbox on hbox.idHumidityBox = hr.idHumidityBox
	where hbox.idHumidityBox = idBox_r
	order by hr.idHReport desc limit 5;
	$$
LANGUAGE SQL;

--get sensor lecture from a specific report
CREATE OR REPLACE FUNCTION getHumidityReportSensors (idRep int) returns table(sensorNumber int, raw decimal(10,2), interp decimal(10,2)) AS 
	$$
	select hse.sensorNumber, hse.rawValue, hse.ValueInterp from HSensor as hse 
	inner join HumidityReport as hr on hse.idHReport = hr.idHreport
	where hr.idHReport = idRep
	order by hse.sensorNumber;
	$$
LANGUAGE SQL;



--get humidity reports within a range of days
CREATE OR REPLACE FUNCTION getHumidityReports(idBox_r VARCHAR(2), fromDate TIMESTAMP, toDate TIMESTAMP, calibration_r BOOL) RETURNS table(idReport int, 
																																	   reportDate timestamp,
																																	   vectorDate timestamp,
																																	   calibrated boolean) AS
	$$
	SELECT hr.idHReport, hr.date, tv.dateTime, isCalibrated FROM HumidityReport as hr
	inner join timeVector as tv on tv.idTime = hr.idTimeVector
	AND hr.date >= fromDate
	AND	hr.date <= toDate
	AND	idHumidityBox = idBox_r
	AND hr.isCalibrated = calibration_r
	ORDER BY hr.date
	$$
LANGUAGE SQL;

--Funcion que regresa los valores leidos por los sensores en un lapso de tiempo
CREATE OR REPLACE FUNCTION obtenerSensoresReporte(idBox_h varchar(2), fromDate TIMESTAMP, toDate TIMESTAMP, calibration bool) 
returns table(ReportVector timestamp, ReportDate timestamp,idReport int,sensNumber int,valRaw decimal(10,2),valInterp decimal(10,2))as

$$
Select tv.dateTime, hr.date, hr.idHReport, hs.sensorNumber, hs.rawValue, hs.valueInterp from humidityReport as hr
inner join humidityBox as hb on hb.idHumidityBox = idBox_h
inner join timeVector as tv on tv.idTime = hr.idTimeVector
inner join HSensor as hs on hs.idHReport = hr.idHReport
where hr.date >= fromDate
and hr.date <= toDate
and hb.idHumidityBox  = idBox_h
and hr.isCalibrated = calibration
Order by hr.date, hs.sensorNumber
$$
Language sql;

--Prueba para grafico de humedad ******TODAVIA NO SIRVE*******
CREATE OR REPLACE FUNCTION getHumidityGraphData(idBox varchar(2), fromDate TIMESTAMP, toDate TIMESTAMP)
returns table (sensNumb int, idRep int, rawVal decimal(10,2), dateRead TIMESTAMP)as $$

select hs.sensornumber, hs.idhreport, hs.rawValue, hr.date from hsensor as hs
inner join HumidityReport as hr on hs.idHReport = hr.idHReport
where hr.idHumidityBox = idBox
and hr.date >= fromDate
and hr.date <= toDate
order by hs.sensornumber, hr.date
$$
language sql;

--*****Humidity Sensor*****

--adds a new sensor for the last Humidity Report generated
CREATE OR REPLACE FUNCTION addHSensor (id_report integer, sensor_number int, raw_value decimal(10,2), value_interp decimal(10,2)) RETURNS void AS $$
Begin
	insert into Hsensor(sensorNumber,idHReport,rawValue,valueInterp)
	values (sensor_number,id_report,raw_value,value_interp);
END;
$$ LANGUAGE plpgsql;


--*****Temperature Register*****

--Creates a new temperature register
CREATE OR REPLACE FUNCTION createTemperatureRegister() RETURNS int AS $$
Declare
	tempID integer;
Begin
	insert into TemperatureRegister (date)
	values (current_timestamp);
	select (select idTempRegister from temperatureregister order by date desc limit 1) into tempID;
	return tempID;
END;
$$ LANGUAGE plpgsql;

--Get last temperature register
CREATE OR REPLACE FUNCTION lastTemperatureRegister () returns table(idTempRegister int, ActualDate timestamp, vectorDate timestamp, idTime int) AS 
	$$
	select tr.idTempRegister, tr.date, tv.dateTime, tv.idTime from temperatureRegister as tr
	inner join timeVector as tv on tv.idtime = tr.idtimevector
	order by tr.date desc limit 1;
	$$
LANGUAGE SQL;

--get data from a temperature registers in a range of time by box id 
CREATE OR REPLACE FUNCTION getTemperatureRegisters(fromDate TIMESTAMP, toDate TIMESTAMP) RETURNS table(idTempRegister int, reportDate timestamp,
																									   vectorDate timestamp, idTimeVector int) AS
	$$
	SELECT tr.idTempRegister, tr.date, tv.dateTime, tv.idTime from temperatureRegister as tr
	inner join timeVector as tv on tv.idtime = tr.idtimevector
	AND tr.date >= fromDate
	AND	tr.date <= toDate
	ORDER BY tr.date
	$$
LANGUAGE SQL;

--*****Temperatures*****

--adds a new temperature entry to the last temperature register created
CREATE OR REPLACE FUNCTION addTemperature (tempID integer, temp_sens_number int, temp_read decimal(5,2)) RETURNS void AS $$
Begin
	insert into Temperatures(tempSensNumber, idTempRegister, temperature)
	values (temp_sens_number, tempID, temp_read);
END;
$$ LANGUAGE plpgsql;

--Get temperatures by register id
CREATE OR REPLACE FUNCTION getTemperatures (regID int) returns table(sensorNumber int, temperature decimal(5,2), timeRead TIMESTAMP) AS 
	$$
	select tp.tempSensNumber, tp.temperature, tr.date from temperatures as tp
	inner join temperatureRegister as tr on tr.idTempRegister = tp.idTempRegister
	where tr.idTempRegister = regID
	order by tp.tempSensNumber asc limit 5;
	$$
LANGUAGE SQL;
