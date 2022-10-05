--*****User table*****
--Create new user
CREATE OR REPLACE FUNCTION createUser (user_name varchar(30), name_user varchar(40), first_LastName varchar(20), second_LastName varchar (20),
									   email_user varchar (50), password_user varchar (30), phone_Number varchar (20)) RETURNS void AS $$
insert into users (username, name, firstLastName, secondLastName, email, password, phoneNumber)
values (user_name, name_user, first_LastName, second_LastName, email_user, password_user, phone_Number);
END;
$$ LANGUAGE sql;

--*****Flow Box table*****

--creates a new flow box
CREATE OR REPLACE FUNCTION createFlowBox (box_Name varchar(50), box_location varchar(50)) RETURNS void AS $$
insert into FlowBox (name, location)
values (box_Name, box_location);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION updateFBoxLocation (box_Name varchar(50), box_location varchar(50)) RETURNS void AS $$
update FlowBox
set location = box_location
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
CREATE OR REPLACE FUNCTION addFSensor (sensor_number int, raw_value decimal(10,5), value_interp decimal(10,5)) RETURNS void AS $$
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







