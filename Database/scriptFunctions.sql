--*****User table*****
--Create new user
CREATE OR REPLACE FUNCTION createUser (user_name varchar(30), name_user varchar(40), first_LastName varchar(20), second_LastName varchar (20),
									   email_user varchar (50), password_user varchar (30), phone_Number varchar (20)) RETURNS void AS $$
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
CREATE OR REPLACE FUNCTION createFlowBox (box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
insert into FlowBox (name, location, latlong)
values (box_Name, box_location, box_latlong);
$$ LANGUAGE sql;

--Update the location of a flow box
CREATE OR REPLACE FUNCTION updateFBoxLocation (box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
update FlowBox
set location = box_location, latlong = box_latlong
where name = box_Name
$$ LANGUAGE sql;

--*****Flow Report table*****

--creates a new flow report 
CREATE OR REPLACE FUNCTION createFlowReport (box_Name varchar(30)) RETURNS void AS $$
Declare
	idFlowBox int;
Begin
	idFlowBox := (select FlowBox.idFlowBox from FlowBox where name = box_Name);
	insert into FlowReport (idFlowBox,date)
	values (idFLowBox, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

--*****Flow Sensors*****

--adds a new sensor entry to the last flow report created
CREATE OR REPLACE FUNCTION addFSensor (sensor_number int, raw_value decimal(10,2), value_interp decimal(10,2)) RETURNS void AS $$
Declare
	idFlowReport int;
Begin
	idFlowReport := (select idFReport from FlowReport order by date desc limit 1);
	insert into FSensor(sensorNumber,idFReport,rawValue,valueInterp)
	values (sensor_number,idFlowReport,raw_value,value_interp);
END;
$$ LANGUAGE plpgsql;

--*****Relays State*****

--creates a new relay state report
CREATE OR REPLACE FUNCTION createRelayState() RETURNS void AS $$
Begin
	insert into RelayState (date)
	values (current_timestamp);
END;
$$ LANGUAGE plpgsql;

--*****Relays*****

--adds a new relay entry to the last relay state created
CREATE OR REPLACE FUNCTION addRelay (relay_number int, relay_state boolean) RETURNS void AS $$
Declare
	idRState int;
Begin
	idRState := (select rs.idRelayState from RelayState as rs order by date desc limit 1);
	insert into Relays(relayNumber, idRelayState, state)
	values (relay_number, idRState, relay_state);
END;
$$ LANGUAGE plpgsql;

--*****Humidity Box*****

--Create a new Humidity Box
CREATE OR REPLACE FUNCTION createHumidityBox (idHumBox varchar(2), box_Name varchar(50), box_location varchar(50), box_latlong varchar (50)) RETURNS void AS $$
insert into HumidityBox (idhumiditybox,name, location, latlong)
values (idHumBox, box_Name, box_location, box_latlong);
$$ LANGUAGE sql;

--Update the location of a Humidity Box
CREATE OR REPLACE FUNCTION updateHBoxLocation (box_Name varchar(50), box_location varchar(50), box_latlong varchar(50)) RETURNS void AS $$
update HumidityBox
set location = box_location, latlong = box_latlong
where name = box_Name
$$ LANGUAGE sql;

--*****Humidity Report*****

--Create a new humidity report
CREATE OR REPLACE FUNCTION createHumidityReport (box_id varchar(2)) RETURNS void AS $$
Begin
	insert into HumidityReport (idhumiditybox,date)
	values (box_id, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

--*****Humidity Sensor*****

--adds a new sensor for the last Humidity Report generated
CREATE OR REPLACE FUNCTION addHSensor (sensor_number int, raw_value decimal(10,2), value_interp decimal(10,2)) RETURNS void AS $$
Declare
	idHumidityReport int;
Begin
	idHumidityReport := (select idHReport from HumidityReport order by date desc limit 1);
	insert into Hsensor(sensorNumber,idHReport,rawValue,valueInterp)
	values (sensor_number,idHumidityReport,raw_value,value_interp);
END;
$$ LANGUAGE plpgsql;

--*****Temperature Register*****

--Creates a new temperature register
CREATE OR REPLACE FUNCTION createTemperatureState() RETURNS void AS $$
Begin
	insert into TemperatureRegister (date)
	values (current_timestamp);
END;
$$ LANGUAGE plpgsql;

--*****Temperatures*****

--adds a new temperature entry to the last temperature register created
CREATE OR REPLACE FUNCTION addTemperature (temp_sens_number int, temp_read decimal(5,2)) RETURNS void AS $$
Declare
	idTRegister int;
Begin
	idTRegister := (select tr.idTempRegister from TemperatureRegister as tr order by date desc limit 1);
	insert into Temperatures(tempSensNumber, idTempRegister, temperature)
	values (temp_sens_number, idTRegister, temp_read);
END;
$$ LANGUAGE plpgsql;



