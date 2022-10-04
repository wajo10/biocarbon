--*****User table*****
--Create new user
CREATE OR REPLACE FUNCTION createUser (user_name varchar(30), name_user varchar(40), first_LastName varchar(20), second_LastName varchar (20),
									   email_user varchar (50), password_user varchar (30), phone_Number varchar (20)) RETURNS void AS $$
insert into users (username, name, firstLastName, secondLastName, email, password, phoneNumber)
values (user_name, name_user, first_LastName, second_LastName, email_user, password_user, phone_Number);
END;
$$ LANGUAGE sql;

--*****Flow Box table*****
CREATE OR REPLACE FUNCTION createFlowBox (box_Name varchar(50), box_location varchar(50)) RETURNS void AS $$
update FlowBox
set location = box_location
where name = box_Name
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION updateFBoxLocation (box_Name varchar(50)) RETURNS void AS $$
insert into FlowBox (name, location)
values (box_Name, box_location);
END;
$$ LANGUAGE sql;

--*****Flow Report table*****
CREATE OR REPLACE FUNCTION createFlowReport (box_Name varchar(30)) RETURNS void AS $$
Declare
	dateNow TIMESTAMP;
	idFlowBox int;
Begin
	dateNow := CURRENT_TIMESTAMP;
	idFlowBox := (select idFlowBox from FlowBox where name = box_Name);
	insert into FlowReport (idFlowBox,date)
	values (idFLowBox, current_date);
END;
$$ 
LANGUAGE plpgsql;





