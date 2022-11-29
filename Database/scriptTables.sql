--Drop database if exists asistenciaDB
--create database asistenciaDB

--Users table 
create Table Users (
	userName varchar (30) not null,
	name varchar (40) not null,
	firstLastName varchar (20) not null,
	secondLastName varchar (20) not null,
	email varchar (50) not null,
	password varchar (30) not null,
	phoneNumber varchar (20) not null,
	PRIMARY key (userName)
);

--Time vector table for storing rounded up times
create Table timeVector (
	idTime serial not null,
	dateTime TIMESTAMP not NULL,
	primary key (idTime)
);

create Table FlowBox(
	idFlowBox serial not null,
	name varchar (50) not null,
	location varchar (50),
	latlong varchar(50),
	primary key (idFlowBox)
);

create Table FlowReport (
	idFReport serial not null,
	idFlowBox int not null,
	idTimeVector int,
	date TIMESTAMP not null,
	primary key (idFReport)
);

create Table FSensor (
	sensorNumber int not null, --este numero lo pasa
	idFReport int not null,
	rawValue decimal (10,2) not null,
	valueInterp decimal(10,2) not null,
	primary key (sensorNumber, idFReport)
);

create Table RelayState(
	idRelayState serial not null,
	idTimeVector int not null,
	date TIMESTAMP not null,
	primary key (idRelayState)
);

create Table Relays (
	relayNumber int not null,
	idRelayState int not null,
	state boolean not null,
	primary key (relayNumber,idRelayState)
);

create Table HumidityBox (
	idHumidityBox serial not null,
	name varchar(50) not null,
	location varchar(50),
	latlong varchar(50),
	primary key (idHumidityBox)	
);

create Table HumidityReport(
	idHReport serial not null,
	idHumidityBox int not null,
	idTimeVector int not null,
	date TIMESTAMP not null,
	primary key (idHReport)
);

create Table HSensor(
	sensorNumber int not null, --este valor se pasa
	idHReport int not null,
	rawValue decimal(10,2) not null,
	valueInterp decimal (10,2) not null,
	primary key (sensorNumber, idHReport)
);

create Table TemperatureRegister (
	idTempRegister serial not null,
	idTimeVector int not null,
	date TIMESTAMP not null,
	primary key (idTempRegister)
);

create Table Temperatures(
	tempSensNumber int not null,
	idTempRegister int not null,
	Temperature decimal (5,2),
	primary key (tempSensNumber, idTempRegister)
);

--Table Constraints 

--Users
alter table Users 
add constraint unique_Name
unique (name);

alter table Users 
add constraint unique_email
unique (email);

--Flow Report
alter table FlowReport 
add constraint FK_idFlowBox
foreign key (idFlowBox) references FlowBox(idFlowBox);

alter table FlowReport 
add constraint FK_idTimeVector
foreign key (idTimeVector) references timeVector (idTime);

--Flow Box
alter table FlowBox 
add constraint unique_name
unique (name);

--FSensor
alter table FSensor 
add constraint FK_idFReport
unique (idFReport);

--Relay State
alter table RelayState 
add constraint FK_idTimeVector
FOREIGN KEY (idtimevector) references timeVector (idTime);

--Relays
alter table Relays 
add constraint FK_Relays
FOREIGN KEY (idrelaystate) references RelayState(idRelayState);

--Humidity Box
alter table HumidityBox
add constraint unique_name
unique (name);

--Humidity Report
alter table HumidityReport 
add constraint FK_idHumidityReport
FOREIGN KEY (idHumidityBox) references HumidityBox(idHumidityBox);

alter table HumidityReport 
add constraint FK_idTimeVector
FOREIGN KEY (idTimeVector) references timeVector(idTime);

--Humidity Sensor
alter table HSensor 
add constraint FK_idHReport
FOREIGN KEY (idHReport) references HumidityReport(idHReport);

--Temperature Register
alter table TemperatureRegister
add constraint FK_idTimeVector
FOREIGN KEY (idTimeVector) references timeVector(idTimeVector);

--Temperatures
alter table Temperatures 
add constraint FK_idTempRegister
FOREIGN KEY (idtempregister) references temperatureRegister(idtempregister);