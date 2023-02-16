--DROP DATABASE IF EXISTS Biocarbon;

--CREATE DATABASE  Biocarbon;
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
	vectorTimestamp INT NOT NULL,
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
	vectorTimestamp INT NOT NULL,
	SensorA FLOAT,
	SensorB FLOAT,
	SensorC FLOAT,
	SensorD FLOAT,
	SensorE FLOAT,
    rawSensorA FLOAT,
    rawSensorB FLOAT,
    rawSensorC FLOAT,
    rawSensorD FLOAT,
    rawSensorE FLOAT,
	isCalibration BOOL NOT NULL,
	idBox VARCHAR(2) NOT NULL,
	CONSTRAINT PK_HumidityReport PRIMARY KEY (idReport)
);

CREATE TABLE timeVector(
	idTime SERIAL NOT NULL UNIQUE,
	DateTime TIMESTAMP NOT NULL
);

CREATE TABLE relaysState(
	idState SERIAL NOT NULL,
	DateTime TIMESTAMP NOT NULL,
	relay1 BOOL NOT NULL,
	relay2 BOOL NOT NULL,
	relay3 BOOL NOT NULL,
	relay4 BOOL NOT NULL,
	relay5 BOOL NOT NULL,
	relay6 BOOL NOT NULL,
	CONSTRAINT PK_relaysState PRIMARY KEY (idState)
);

CREATE TABLE temperature(
	idTemperature SERIAL NOT NULL,
	temperature1 INT NOT NULL,
	temperature2 INT NOT NULL,
	temperature3 INT NOT NULL,
	temperature4 INT NOT NULL,
	temperature5 INT NOT NULL,
	CONSTRAINT PK_temperature PRIMARY KEY (idTemperature)

);

--Foreign Keys
ALTER TABLE FlowReport ADD CONSTRAINT FK_Device_Flow_Report
FOREIGN KEY(idBox) REFERENCES FlowBox(idBox)
ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE FlowReport ADD CONSTRAINT FK_Time_Stamp_Flow
FOREIGN KEY(vectorTimestamp) REFERENCES timeVector(idTime)
ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE HumidityReport ADD CONSTRAINT FK_Device_Humidity_Report
FOREIGN KEY(idBox) REFERENCES HumidityBox(idBox)
ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE HumidityReport ADD CONSTRAINT FK_Time_Stamp_Humidity
FOREIGN KEY(vectorTimestamp) REFERENCES timeVector(idTime)
ON DELETE RESTRICT ON UPDATE RESTRICT;
