---------------Funciones del usuario--------------------
CREATE OR REPLACE FUNCTION addUser (UserName_r varchar, Name_r varchar, FirstLastName_r varchar, SecondLastName_r varchar, Email_r varchar, PhoneNumber_r varchar,
										 Password_r varchar) RETURNS void AS $$
	DECLARE
		EncodedPassword varchar;
	Begin
		SELECT crypt(Password_r, gen_salt('bf', 4)) into EncodedPassword;

	insert into Users(UserName,Name,FirstLastName,SecondLastName,Email,PhoneNumber,Password) 
	values (UserName_r, Name_r,FirstLastName_r,SecondLastName_r,Email_r, PhoneNumber_r, EncodedPassword );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validateUser(UserName_r varchar, Password_r varchar) RETURNS Users AS 
	$$
	(SELECT * FROM USERS WHERE UserName_r = UserName and Password = crypt(Password_r, Password))
	$$
Language SQL;

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

-------------------Funciones Dispositivos------------
	--Flow
CREATE OR REPLACE FUNCTION addFlowBox(idBox_r INT, name_r VARCHAR, location_r VARCHAR ) RETURNS VOID AS
	$$
	INSERT INTO FlowBox(idBox,name, location)
	VALUES(idBox_r,name_r,location_r);
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION modifyFlowBox (idBox_r INT, name_r VARCHAR, location_r VARCHAR) RETURNS void AS $$
	UPDATE FlowBox
	SET Name = name_r, location = location_r
	WHERE idBox = idBox_r;
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getFlowBox(idBox_r INT) RETURNS FlowBox AS
	$$
	SELECT * FROM FlowBox WHERE 
	idBox = idBox_r
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getFlowBoxes() RETURNS setof FlowBox AS
	$$
	SELECT * FROM FlowBox
	$$
LANGUAGE SQL;

	--Humidity
	
CREATE OR REPLACE FUNCTION addHumidityBox(idBox_r VARCHAR, name_r VARCHAR, location_r VARCHAR ) RETURNS VOID AS
	$$
	INSERT INTO HumidityBox(idBox,name, location)
	VALUES(idBox_r,name_r,location_r);
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION modifyHumidityBox (idBox_r VARCHAR, name_r VARCHAR, location_r VARCHAR) RETURNS void AS $$
	UPDATE HumidityBox
	SET Name = name_r, location = location_r
	WHERE idBox = idBox_r;
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getHumidityBox(idBox_r VARCHAR) RETURNS HumidityBox AS
	$$
	SELECT * FROM HumidityBox WHERE 
	idBox = idBox_r
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getHumidityBoxes() RETURNS setof HumidityBox AS
	$$
	SELECT * FROM HumidityBox
	$$
LANGUAGE SQL;

-----------------Reportes--------------------------
CREATE OR REPLACE FUNCTION lastFlowReport (idBox_r INT) RETURNS TABLE(idReport INT, date TIMESTAMP, vectorTimestamp INT, FLOW1 FLOAT, FLOW2 FLOAT, 
																	  FLOW3 FLOAT, FLOW4 FLOAT, FLOW5 FLOAT, isCalibration BOOLEAN,
																	 idBox INT, idTime INT, dateTime TIMESTAMP) AS 
	$$
	SELECT * FROM FlowReport  
	NATURAL JOIN TIMEVECTOR WHERE VECTORTIMESTAMP = IDTIME AND idBox = idBox_r
	ORDER BY idReport DESC LIMIT 1
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION lastHumidityReport (idBox_r VARCHAR) RETURNS HUMIDITY AS 
	$$
	SELECT * FROM humidityReport  
	NATURAL JOIN TIMEVECTOR WHERE VECTORTIMESTAMP = IDTIME AND idBox = idBox_r
	ORDER BY idReport DESC LIMIT 1
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION lastTemperatureReport () RETURNS TEMPERATURE AS 
	$$
	SELECT * FROM temperature  
	ORDER BY dateTime DESC LIMIT 1
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION lastTenHumidityReports (idBox_r VARCHAR) RETURNS HUMIDITY AS
	$$
	SELECT * FROM humidityReport  
	NATURAL JOIN TIMEVECTOR WHERE VECTORTIMESTAMP = IDTIME AND idBox = idBox_r
	ORDER BY idReport DESC LIMIT 10
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addFlowReport(idBox_r INT, Date_r TIMESTAMP, flow1_r FLOAT, flow2_r FLOAT, flow3_r FLOAT, flow4_r FLOAT, 
										 flow5_r FLOAT, calibration_r BOOL , idVector_r INT) RETURNS VOID AS 
	$$
	INSERT INTO FlowReport(idBox, Date, Flow1, Flow2, Flow3, Flow4, Flow5, isCalibration, vectorTimestamp )
	VALUES (idBox_r, Date_r, flow1_r, flow2_r, flow3_r, flow4_r, flow5_r, calibration_r, idVector_r)
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addHumidityReport(idBox_r VARCHAR, Date_r TIMESTAMP, sensorA_r FLOAT, rawSensorA_r FLOAT, sensorB_r FLOAT, rawSensorB_r FLOAT, 
                                             sensorC_r FLOAT, rawSensorC_r FLOAT, sensorD_r FLOAT, rawSensorD_r FLOAT, sensorE_r FLOAT, 
                                             rawSensorE_r FLOAT,calibration_r BOOLEAN, idvector_r INT ) RETURNS VOID AS 
	$$
	INSERT INTO HumidityReport(idBox, Date, sensorA, rawSensorA, sensorB,rawSensorB, sensorC, rawSensorC, sensorD,rawSensorD, 
                               sensorE,rawSensorE, isCalibration, vectorTimestamp )
	VALUES (idBox_r, Date_r, sensorA_r, rawSensorA_r, sensorB_r, rawSensorB_r, sensorC_r, rawSensorC_r, sensorD_r, rawSensorD_r, 
            sensorE_r,  rawSensorE_r,calibration_r, idvector_r)
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addTemperatureReport(Date_r TIMESTAMP, temperature1_r FLOAT, temperature2_r FLOAT, temperature3_r FLOAT, temperature4_r FLOAT, 
										 temperature5_r FLOAT) RETURNS VOID AS 
	$$
	INSERT INTO Temperature (Datetime,temperature1, temperature2, temperature3, temperature4, temperature5 )
	VALUES (Date_r, temperature1_r, temperature2_r, temperature3_r, temperature4_r, temperature5_r)
	$$
LANGUAGE SQL;

--Create Types
--CREATE TYPE flow as (idReport INT, date TIMESTAMP, vectorTimestamp INT, flow1 FLOAT, flow2 FLOAT, 
--																	  flow3 FLOAT, flow4 FLOAT, flow5 FLOAT, isCalibration BOOLEAN,
--																 idBox INT,  idTime INT, dateTime TIMESTAMP);
																	 
--CREATE TYPE humidity as (idReport INT, date TIMESTAMP,vectorTimestamp INT, sensora FLOAT, rawsensora FLOAT, sensorb FLOAT, rawsensorb FLOAT, 
--																	  sensorc FLOAT, rawsensorc FLOAT, sensord FLOAT, rawsensord FLOAT,
--                                                                      sensore FLOAT, rawsensore FLOAT, isCalibration BOOLEAN,
--																	  idBox VARCHAR,  idTime INT, dateTime TIMESTAMP);
																	 
CREATE OR REPLACE FUNCTION getFlowReports(idBox_r int, fromDate TIMESTAMP, toDate TIMESTAMP, calibration_r BOOL) RETURNS SETOF FLOW AS
	$$
	SELECT * FROM FlowReport  
	NATURAL JOIN TIMEVECTOR WHERE VECTORTIMESTAMP = IDTIME
		AND
		date >= fromDate
		AND
		date <= toDate
		AND
		idBox = idBox_r
		AND 
		isCalibration = calibration_r
	ORDER BY date
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addTimeVector(datetime_r TIMESTAMP) RETURNS INT AS
	$$
		INSERT INTO timeVector(dateTime) VALUES (datetime_r) RETURNING idTime
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getTimeVectors() RETURNS SETOF timeVector AS
	$$
	SELECT * FROM timevector
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getTimeVector(datetime_r TIMESTAMP) RETURNS timeVector AS
	$$
	SELECT * FROM timeVector WHERE datetime = datetime_r
	$$
LANGUAGE SQL;


CREATE OR REPLACE FUNCTION getHumidityReports(idBox_r VARCHAR, fromDate TIMESTAMP, toDate TIMESTAMP, calibration_r BOOL) RETURNS setof Humidity AS
	$$
	SELECT * FROM HumidityReport
	NATURAL JOIN TIMEVECTOR WHERE VECTORTIMESTAMP = IDTIME
		AND
		date >= fromDate
		AND
		date <= toDate
		AND
		idBox = idBox_r
		AND 
		isCalibration = calibration_r
	ORDER BY date
	$$
LANGUAGE SQL;