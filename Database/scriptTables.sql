--Drop database if exists asistenciaDB
--create database asistenciaDB

--Users table 
create Table Users (
	userName varchar (60) not null,
	name varchar (40) not null,
	firstLastName varchar (20) not null,
	secondLastName varchar (20) not null,
	email varchar (50),
	password varchar (30) not null,
	phoneNumber varchar (20),
	PRIMARY key (userName)
);

--Time vector table for storing rounded up times
create Table timeVector (
	idTime int IDENTITY(1,1),
	dateTime TIMESTAMP not NULL,
	primary key (idTime)
);

create Table FlowBox(
	idFlowBox int identity(1,1),
	name varchar (50) not null,
	location varchar (50),
	primary key (idFlowBox)
);

create Table FlowReport (
	idFReport int IDENTITY(1,1),
	idFlowBox int not null,
	idTimeVector int,
	date TIMESTAMP with time zone not null,
	primary key (idFReport)
);

create Table FSensor (
	sensorNumber int not null,
	idFReport int not null,
	rawValue decimal (8,5),
	valueInterp decimal(8,5),
	primary key (sensorNumber, idFReport)
);

create Table RelayState(
	idRelayState identity(1,1),
	idTimeVector int not null,
	primary key (idRelayState)
);

create Table Relays (
	relayNumber int not null,
	idRelayState int not null,
	state boolean not null,
	primary key (relayNumber)
);

create Table HumidityBox (
	idHumidityBox identity (1,1),
	name varchar(50) not null,
	location varchar(50),
	primary key (idHumidityBox)	
);

create Table HumidityReport(
	idHReport identity(1,1),
	idHumidityBox int not null,
	idTimeVector int not null,
	date TIMESTAMP not null,
	primary key (idHReport);
);

create Table HSensor(
	sensorNumber identity (1,1),
	idHReport int not null,
	rawValue decimal(8,5),
	valueInterp decimal (8,5),
	primary key (sensorNumber, idHReport)
);

create Table 


