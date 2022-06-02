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
CREATE OR REPLACE FUNCTION lastFlowReport (idBox_r INT) RETURNS FlowReport AS 
	$$
	SELECT * FROM FlowReport WHERE idBox = idBox_r ORDER BY idReport DESC LIMIT 1
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION lastHumidityReport (idBox_r VARCHAR) RETURNS HumidityReport AS 
	$$
	SELECT * FROM HumidityReport WHERE idBox = idBox_r ORDER BY idReport DESC LIMIT 1
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION lastTenHumidityReports (idBox_r VARCHAR) RETURNS HumidityReport AS 
	$$
	SELECT * FROM HumidityReport WHERE idBox = idBox_r ORDER BY idReport DESC LIMIT 10
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addFlowReport(idBox_r INT, Date_r TIMESTAMP, flow1_r FLOAT, flow2_r FLOAT, flow3_r FLOAT, flow4_r FLOAT, 
										 flow5_r FLOAT, calibration_r BOOL ) RETURNS VOID AS 
	$$
	INSERT INTO FlowReport(idBox, Date, Flow1, Flow2, Flow3, Flow4, Flow5, isCalibration )
	VALUES (idBox_r, Date_r, flow1_r, flow2_r, flow3_r, flow4_r, flow5_r, calibration_r)
	$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION addHumidityReport(idBox_r VARCHAR, Date_r TIMESTAMP, sensorA_r FLOAT, sensorB_r FLOAT,  sensorC_r FLOAT, sensorD_r FLOAT, 
										 sensorE_r FLOAT, calibration_r BOOL ) RETURNS VOID AS 
	$$
	INSERT INTO HumidityReport(idBox, Date, sensorA, sensorB, sensorC, sensorD, sensorE, isCalibration )
	VALUES (idBox_r, Date_r, sensorA_r, sensorB_r, sensorC_r, sensorD_r, sensorE_r, calibration_r)
	$$
LANGUAGE SQL;


CREATE OR REPLACE FUNCTION getFlowReports(idBox_r int, fromDate TIMESTAMP, toDate TIMESTAMP, calibration_r BOOL) RETURNS setof FlowReport AS
	$$
	SELECT * FROM FlowReport WHERE 
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


CREATE OR REPLACE FUNCTION getHumidityReports(idBox_r VARCHAR, fromDate TIMESTAMP, toDate TIMESTAMP, calibration_r BOOL) RETURNS setof HumidityReport AS
	$$
	SELECT * FROM HumidityReport WHERE 
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