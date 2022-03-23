--DROP DATABASE IF EXISTS COSECHA_AGUA;

CREATE DATABASE  COSECHA_AGUA;
CREATE EXTENSION pgcrypto;

CREATE TABLE Users(
	Name varchar NOT NULL,
	FirstLastname varchar NOT NULL,
	SecondLastname varchar,
	Email text,
	PhoneNumber varchar,
	Username varchar(60) NOT NULL,
	Password varchar NOT NULL,
	CONSTRAINT PK_Users PRIMARY KEY (Username)
);

CREATE TABLE FlowBox(
	idBox INT NOT NULL,
	name  VARCHAR NOT NULL,
	location VARCHAR,
	CONSTRAINT PK_FlowBox PRIMARY KEY (idBox)
);

CREATE TABLE FlowReport(
	idReport SERIAL NOT NULL,
	Date TIMESTAMP NOT NULL,
	Flow1 FLOAT,
	Flow2 FLOAT,
	Flow3 FLOAT,
	Flow4 FLOAT,
	Flow5 FLOAT,
	isCalibration BOOL NOT NULL,
	idBox INT NOT NULL,
	CONSTRAINT PK_FlowReport PRIMARY KEY (idReport)
);

CREATE TABLE HumidityBox(
	idBox VARCHAR(2) NOT NULL,
	name  VARCHAR NOT NULL,
	location VARCHAR,
	CONSTRAINT PK_HumidityBox PRIMARY KEY (idBox)
);

CREATE TABLE HumidityReport(
	idReport SERIAL NOT NULL,
	Date TIMESTAMP NOT NULL,
	SensorA FLOAT,
	SensorB FLOAT,
	SensorC FLOAT,
	SensorD FLOAT,
	SensorE FLOAT,
	isCalibration BOOL NOT NULL,
	idBox VARCHAR(2) NOT NULL,
	CONSTRAINT PK_HumidityReport PRIMARY KEY (idReport)
);

--Foreign Keys
ALTER TABLE FlowReport ADD CONSTRAINT FK_Device_Flow_Report
FOREIGN KEY(idBox) REFERENCES FlowBox(idBox)
ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE HumidityReport ADD CONSTRAINT FK_Device_Humidity_Report
FOREIGN KEY(idBox) REFERENCES HumidityBox(idBox)
ON DELETE RESTRICT ON UPDATE RESTRICT;