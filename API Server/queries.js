const fs = require("fs");
module.exports = function(devices) {
    const axios = require('axios');
    const https = require('https');
    const promise = require('bluebird');
    const {json} = require("express");
    var fs = require('fs');

    const options = {
        // Initialization Options
        promiseLib: promise
    };


    var pgp = require('pg-promise')(options);
    var connectionString = 'postgres://postgres:admin@localhost:5432/BiocarbonV2';
    var db = pgp(connectionString);

    process.env.TELEGRAM_TOKEN = "6125458886:AAFe6vpSlr5QAqO3z2LKWKe0RLht9TKd6cI"
    process.env.TELEGRAM_CHANNEL = "-1001827446396"


//Queries de Usuarios
    function login(req, res, next) {
        var User = req.params.User;
        var Password = req.params.Password;
        db.one('select * from validateUser($1,$2)', [User, Password])
            .then(function (data) {
                console.log(data);
                if (data["name"] !== null) {
                    res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Login successful'
                        });
                } else {
                    res.status(403)
                        .json({
                            status: 'failed',
                            message: 'Login Failed'
                        });
                }
            })
            .catch(function (err) {
                return next(err);
            });
    }

    function modifyUser(req, res, next) {
        console.log(req.body);
        db.any('select modifyUser(${username}, ${name}, ${firstlastname}, ${secondlastname}, ${email}, ${phonenumber}, ${password})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'User Modified'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }

    function addUser(req, res, next) {
        console.log(req.body);
        db.any('select createUser(${username}, ${name}, ${firstlastname}, ${secondlastname}, ${email}, ${password}, ${phonenumber})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'User Created'
                    });
            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'Error',
                        message: 'El usuario ya existe'
                    });
                return next(err);
            });
    }

    function testConnection(req, res, next) {
        res.status(200)
            .json({
                status: 'success',
                data: "Connection Established",
                message: 'Data Retrieved Successfully'
            });
        axios.get("http://172.17.7.33:3033/api/biocarbon/test")
            .then(res => {
                console.log(`statusCode: ${res.status}`);
                console.log(res);
            })
            .catch(error => {
                console.error(error);
            });
    }

    //Queries de reports
    function getLastFlowReport(req, res, next) {
        const Device = req.params.idBox;
        db.one('select * from lastFlowReport ($1)', [Device])
            .then(function (data) {
                console.log(data);
                db.any('select * from lastFlowReportSensors ($1)', [Device]).then(function (dataSensors) {
                    res.status(200).json({
                        status: 'success',
                        data: data,
                        dataSensors: dataSensors,
                        message: 'Data Retrieved Successfully'
                    });
                });

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving data'
                    });
                return next(err);
            });

    }

    function getLastHumidityReport(req, res, next) {
        const Device = req.params.idBox;
        const sensors = ["sensora", "sensorb", "sensorc", "sensord", "sensore"];
        const rawsensors = ["rawsensora", "rawsensorb", "rawsensorc", "rawsensord", "rawsensore"];
        let json = {};
        db.any('select * from lastHumidityReport ($1)', [Device])
            .then(function (data) {
                json["date"] = data[0]["actualdate"];
                json["datetime"] = data[0]["vectordate"];
                json["idbox"] = data[0]["idhbox"];
                json["iscalibration"] = data[0]["calibrated"];
                json["idreport"] = data[0]["idhreport"];
                db.any('select * from lastHumidityReportSensors ($1)', [Device]).then(function (dataSensors) {
                    for (let i = 0; i < dataSensors.length; i++) {
                        json[sensors[i]] = dataSensors[i].interp;
                        json[rawsensors[i]] = dataSensors[i].raw;
                    }
                    res.status(200).json({
                        status: 'success',
                        data: json,
                        message: 'Data Retrieved Successfully'
                    });
                });
                console.log(Device);

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving data'
                    });
                return next(err);
            });

    }

    function latestHumReport(){
        db.one('select * from latestHumReport()')
            .then(function (data) {
                //Check if date is in the last 5 hours
                let date = new Date(data.date);
                let now = new Date();
                let diff = now - date;
                console.log("Diff: " + diff + " Date: " + date + " Now: " + now);
                if (diff > 18000000) {
                    //Send telegram message to channel fetching url
                    let message = "ALERTA El último reporte de humedad fue hace " + Math.floor(diff / 60000) + " minutos por la Caja: " + data['idhumiditybox'];
                    https.get("https://api.telegram.org/bot" + process.env.TELEGRAM_TOKEN + "/sendMessage?chat_id=" + process.env.TELEGRAM_CHANNEL + "&text=" + message, (resp) => {
                        console.log("Message Sent");
                    });

                }
                else{
                    console.log("No message sent");
                }
            })
    }

    function getLastTemperatureReport(req, res, next) {
        db.one('select * from lastTemperatureRegister()')
            .then(function (data) {
                db.any('select * from getTemperatures($1)',[data.idtempregister]).then(function (dataSensors) {
                    res.status(200)
                        .json({
                            status: 'success',
                            data: dataSensors,
                            message: 'Data Retrieved Successfully'
                        });
                });


            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving data'
                    });
                return next(err);
            });
    }

    function getTemperatureReports(req, res, next) {
        db.any('select * from getTemperaturesByDateRange(${fromdate},${todate})', req.body)
            .then(function (data) {
                // Agrupar por fecha y hora
                let groupedData = data.reduce((acc, item) => {
                    // Convertir a formato yyyy-mm-dd HH:MM:SS para usar como clave
                    let dateTimeKey = new Date(item.timeread).toISOString().replace('T', ' ').slice(0, 19);
                    // Inicializar si la fecha no existe
                    if (!acc[dateTimeKey]) {
                        acc[dateTimeKey] = {};
                    }
                    // Agregar la temperatura de cada sensor a la fecha y hora
                    acc[dateTimeKey][`sensor${item.sensornumber}`] = item.temperature;
                    return acc;
                }, {});

                res.status(200).json({
                    status: 'success',
                    data: groupedData,
                    message: 'Info received'
                });
            })
            .catch(function (err) {
                res.status(400).json({
                    status: 'Error',
                    error: err.message
                });
                return next(err);
            });
    }



    function filtro(Device, Sensor, Data) {
        Sensor = Sensor.toLowerCase();
        let arrayValues = [];
        let isgood = "";
        return new Promise(resolve => db.any('select * from lastTenHumidityReports ($1)', [Device])
            .then(function (data) {
                console.log(Sensor);
                let mean = 0;
                for (let i = 0; i < data.length; i++) {
                    let dataJSON = JSON.stringify(data[i]);
                    dataJSON = JSON.parse(dataJSON);
                    let value = dataJSON[Sensor];
                    arrayValues.push(value);
                    mean = value + mean;
                }
                arrayValues.sort(function (a, b) {
                    return b - a
                });
                let median = (arrayValues[4] + arrayValues[5]) / 2;
                mean = mean / 10;
                let variance = 0;

                for (let i = 0; i < data.length; i++) variance = variance + Math.pow(arrayValues[i] - mean, 2);
                variance = variance / 10;

                let stDev = Math.sqrt(variance);
                let zscore = (Data - median) / stDev;
                if (Math.abs(zscore) < 2) isgood = "1";
                else isgood = "0";

                let retValue = `Median: ${median}, Standard Deviation: ${stDev}, ZScore: ${zscore} isGood: ${isgood}`;
                console.log(retValue);
                console.log(arrayValues);

                resolve(isgood);
            }))
    }


function humidityEquation(humidity, box, sensor) {
    switch (box) {
        case "A":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.04 * 10 ** -5 + 0.5490385053) * 100
                case "sensor2":
                    return (humidity ** 2 * (-5.25 * 10 ** -10) + humidity * -0.000006634669025 + 0.497670979917851) * 100
                case "sensor3":
                    return (humidity * -9.98 * 10 ** -6 + 0.54109349) * 100
                case "sensor4":
                    return (humidity * -1.01 * 10 ** -5 + 0.5464881968) * 100
                case "sensor5":
                    return (humidity * -9.80 * 10 ** -6 + 0.5316246624) * 100
            }
            break;
        case "B":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * (0.000000000159814228) + -0.00002397554725 * humidity + 0.827996039) * 100
                case "sensor2":
                    return (humidity * -0.00001142321622 + 0.6026920892) * 100
                case "sensor3":
                    return (humidity * -0.00001118873827 + 0.5929824513) * 100
                case "sensor4":
                    return (humidity ** 2 * 0.0000000001059273956 + humidity * -0.00001981961495 + 0.7589596257) * 100
                case "sensor5":
                    return (humidity * -0.00001215203406 + 0.6215307717) * 100
            }
            break;
        case "C":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.10174 * 10 ** -5 + 0.595417119) * 100
                case "sensor2":
                    return (humidity * -1.11861 * 10 ** -5 + 0.600855136) * 100
                case "sensor3":
                    return (humidity * -1.15001 * 10 ** -5 + 0.60810348) * 100
                case "sensor4":
                    return (humidity * -1.12847 * 10 ** -5 + 0.600972855) * 100
                case "sensor5":
                    return (humidity * -1.10816 * 10 ** -5 + 0.596240066) * 100
            }
            break;
        case "D":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 2.93517 * 10 ** -10 + humidity * -3.01968 * 10 ** -5 + 0.759721201) * 100
                case "sensor2":
                    return (humidity * -1.36917 * 10 ** -5 + 0.552279556) * 100
                case "sensor3":
                    return (humidity ** 2 * 2.7399 * 10 ** -10 + humidity * -2.91479 * 10 ** -5 + 0.750961815) * 100
                case "sensor4":
                    return (humidity ** 2 * 3.83927 * 10 ** -10 + humidity * -3.47601 * 10 ** -5 + 0.807306733) * 100
                case "sensor5":
                    return (humidity ** 2 * 2.76591 * 10 ** -10 + humidity * -2.8983 * 10 ** -5 + 0.74058965) * 100
            }
            break;
        case "E":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.46 * 10 ** -5 + 0.609739931) * 100
                case "sensor2":
                    return (humidity * -1.46 * 10 ** -5 + 0.609739931) * 100
                    //return (3 * 10 ** 24 * humidity ** -5.243)
                case "sensor3":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (-52.93*Math.log(humidity) + 560.91)
                case "sensor4":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (-52.93*Math.log(humidity) + 560.91)
                    //return (humidity ** 2 * 1 * 10 ** -7 + humidity * -0.0084 + 156.71)
                case "sensor5":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0051 + 126.7)
            }
            break;
        case "F":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0053 + 143.36)
                    //return (humidity ** 2 * 3 * 10 ** -8 + humidity * -0.0031 + 70.868)
                case "sensor2":
                    return (humidity ** 2 * 7 * 10 ** -8 + humidity * -0.0056 + 113.7)
                    //return (humidity ** 2 * 1 * 10 ** -6 + humidity * -0.0856 + 1774)
                case "sensor3":
                    return (humidity ** 2 * 7 * 10 ** -8 + humidity * -0.0056 + 113.7)
                case "sensor4":
                    return (humidity ** 2 * 9 * 10 ** -8 + humidity * -0.007 + 138.64)
                    //return (431.1 * Math.E ** (-0.0001 * humidity))
                case "sensor5":
                    return (humidity ** 2 * 9 * 10 ** -8 + humidity * -0.007 + 138.64)
            }
            break;
        case "G":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0049 + 139.63)
                case "sensor2":
                    return (humidity ** 2 * 2 * 10 ** -8 + humidity * -0.0032 + 117.32)
                case "sensor3":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0046 + 136.57)
                case "sensor4":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (4 * 10 ** 16 * humidity ** -3.407)
                case "sensor5":
                    return (humidity ** 2 * 9 * 10 ** -8 + humidity * -0.0067 + 133.11)
            }
            break;
        case "H":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0053 + 143.36)
                case "sensor2":
                    return (humidity ** 2 * -8.357060326 * 10 ** -11 + humidity * -8.357060326312 * 10 ** -6 + 0.52392936) * 100
                case "sensor3":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0046 + 131.01)
                case "sensor4":
                    return (1 * 10 ** 16 * humidity ** -3.302)
                case "sensor5":
                    return (humidity * -1.13 * 10 ** -5 + 0.618206743) * 100
            }
            break;
        case "I":
            switch (sensor) {
                case "sensor1":
                    return (541.48 * Math.E ** (-0.0001 * humidity))
                case "sensor2":
                    return (humidity ** 2 * -6 * 10 ** -9 + humidity * -0.0012 + 77.357)
                case "sensor3":
                    return (humidity ** 2 * -6 * 10 ** -9 + humidity * -0.0012 + 77.357)
                    //return (851.78 * Math.E ** (-0.0001 * humidity))
                case "sensor4":
                    return (191.24 * Math.E ** (-0.00009 * humidity))
                case "sensor5":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0039 + 98.049)
                    //return (-43.9*Math.log(humidity) + 468.39)
                    //return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0046 + 138.6)
            }
            break;
        case "J":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 8 * 10 ** -8 + humidity * -0.0075 + 189.77)
                case "sensor2":
                    return (humidity ** 2 * 8 * 10 ** -8 + humidity * -0.0075 + 189.77)
                    //return (humidity ** 2 * 9 * 10 ** -8 + humidity * -0.007 + 138.64)
                    //return (1110.5 * Math.E ** (-0.0001 * humidity))
                case "sensor3":
                    return (1 * 10 ** 30 * humidity ** -6.473)
                case "sensor4":
                    return (humidity ** 2 * 9 * 10 ** -9 + humidity * -0.0019 + 70.907)
                case "sensor5":
                    return (-52.93*Math.log(humidity) + 560.91)
                    //return (humidity ** 2 * 1 * 10 ** -8 + humidity * -0.0022 + 92.534)
            }
            break;
        case "K":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0049 + 137.13)
                case "sensor2":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0046 + 132.27)
                case "sensor3":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0043 + 128.27)
                case "sensor4":
                    return (humidity ** 2 * 3 * 10 ** -8 + humidity * -0.0037 + 119.32)
                case "sensor5":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0051 + 145.64)
            }
            break;
        case "L":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0057 + 156.98)
                case "sensor2":
                    return (humidity ** 2 * -4 * 10 ** -8 + humidity * 0.0011 + 39.11)
                case "sensor3":
                    return (humidity ** 2 * 1 * 10 ** -8 + humidity * -0.0021 + 84.323)
                case "sensor4":
                    return (humidity ** 2 * 3 * 10 ** -8 + humidity * -0.0042 + 127.35)
                case "sensor5":
                    return (humidity ** 2 * 6 * 10 ** -8 + humidity * -0.006 + 156.8)
            }
            break;
        case "M":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 7 * 10 ** -8 + humidity * -0.0068 + 170.28)
                case "sensor2":
                    return (391.34 * Math.E ** (-0.00009 * humidity))
                case "sensor3":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0043 + 95.22)
                case "sensor4":
                    return (humidity ** 2 * 4 * 10 ** -8 + humidity * -0.0044 + 125.68)
                case "sensor5":
                    return (humidity ** 2 * 2 * 10 ** -8 + humidity * -0.003 + 104.48)
            }
            break;
        case "N":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 2 * 10 ** -8 + humidity * -0.003 + 104.48)
                    //return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0051 + 137.56)
                case "sensor2":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0043 + 95.22)
                    //return (355.33 * Math.E ** (-0.0001 * humidity))
                case "sensor3":
                    return (391.34 * Math.E ** (-0.00009 * humidity))
                    //return (303.79 * Math.E ** (-0.0001 * humidity))
                case "sensor4":
                    return (-52.93*Math.log(humidity) + 560.91)
                    //return (humidity ** 2 * 6 * 10 ** -8 + humidity * -0.006 + 156.77)
                case "sensor5":
                    return (281.32 * Math.E ** (-0.0001 * humidity))
            }
            break;
        case "O":
            switch (sensor) {
                case "sensor1":
                    return (humidity ** 2 * 5 * 10 ** -8 + humidity * -0.0053 + 149.01)
                case "sensor2":
                    return (-43.9*Math.log(humidity) + 468.39)
                    //return (humidity ** 2 * 3 * 10 ** -8 + humidity * -0.0041 + 125.45)
                case "sensor3":
                    return (218.3 * Math.E ** (-0.0001 * humidity))
                case "sensor4":
                    return (420.11 * Math.E ** (-0.0001 * humidity))
                case "sensor5":
                    return (humidity ** 2 * 7 * 10 ** -8 + humidity * -0.0056 + 114.68)
            }
            break;
            //Estas no tienen calibración todavía
            case "P":
                return humidity;
            case "Q":
                return humidity;
            case "R":
                return humidity;
            case "S":
                return humidity;
            case "T":
                return humidity;

        }
    }

    function testCalibration(req, res, next) {
        let box = req.params.box;
        let sensor = req.params.sensor;
        let humidity = req.params.humidity;
        let value = humidityEquation(humidity, box, sensor);
        res.json(value);
        return (next());
    }

    function getFlowReports(req, res, next) {
        db.any('select * from getFlowReports(${idbox},${fromdate},${todate}, ${iscalibration})', req.body)
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Info received'
                    });
            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'Error'
                    });
                return next(err);
            });
    }

    async function getHumidityReports(req, res, next) {
        const sensors = ["sensora", "sensorb", "sensorc", "sensord", "sensore"];
        const rawsensors = ["rawsensora", "rawsensorb", "rawsensorc", "rawsensord", "rawsensore"];
        let reportsMap = new Map();

        try {
            const data = await db.any('select * from obtenerSensoresReporte(${idbox},${fromdate},${todate}, ${iscalibration})', req.body);

            for (let i = 0; i < data.length; i++) {
                const reportID = data[i].idreport;
                let report = reportsMap.get(reportID);

                if (!report) {
                    const { idreport, reportdate, reportvector, idbox, iscalibration } = data[i];
                    report = { idreport, date: reportdate, datetime: reportvector, idbox: req.body.idbox, iscalibration:req.body.iscalibration };
                    reportsMap.set(reportID, report);
                }

                report[sensors[data[i].sensnumber - 1]] = data[i].valinterp;
                report[rawsensors[data[i].sensnumber - 1]] = data[i].valraw;
            }

            const jsonList = [...reportsMap.values()];
            res.status(200).json({ status: 'success', data: jsonList, message: 'Info received' });
        } catch (err) {
            res.status(400).json({ status: 'Error' });
            return next(err);
        }
    }


    function getHumidityReport(req, res, next) {
        const report = req.params.report;
        db.any(' select * from getHumidityReportSensors($1)', [report])
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Info received'
                    });
            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'Error'
                    });
                return next(err);
            });
    }


    async function addHumidityReport(req, res, next) {
        console.log(req.body);
        req.body.rawSensorA = req.body.sensorA;
        req.body.rawSensorB = req.body.sensorB;
        req.body.rawSensorC = req.body.sensorC;
        req.body.rawSensorD = req.body.sensorD;
        req.body.rawSensorE = req.body.sensorE;
        req.body.sensorA = humidityEquation(req.body.sensorA, req.body.id_box, "sensor1");
        req.body.sensorB = humidityEquation(req.body.sensorB, req.body.id_box, "sensor2");
        req.body.sensorC = humidityEquation(req.body.sensorC, req.body.id_box, "sensor3");
        req.body.sensorD = humidityEquation(req.body.sensorD, req.body.id_box, "sensor4");
        req.body.sensorE = humidityEquation(req.body.sensorE, req.body.id_box, "sensor5");

        const sensorList = ["sensorA", "sensorB", "sensorC", "sensorD", "sensorE"];
        const rawSensorList = ["rawSensorA", "rawSensorB", "rawSensorC", "rawSensorD", "rawSensorE"];
        const idbox = req.body.id_box
        const isCalibration = req.body.isCalibration
        db.oneOrNone('select * from createHumidityReport($1, $2)', [idbox, isCalibration]).then(
            function (data) {
                let idReport = data.createhumidityreport;
                let cont = 1;

                sensorList.forEach(function (sensor) {
                    let sensorData = {
                        idReport: idReport,
                        idSensor: cont,
                        raw: req.body[rawSensorList[cont - 1]],
                        value: req.body[sensor]
                    };
                    db.oneOrNone('select * FROM addHSensor(${idReport}, ${idSensor}, ${raw}, ${value})', sensorData).then(
                        function () {
                            console.log(sensor + " added");
                        }
                    )
                    cont++;
                });
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Humidity Report Inserted'
                    });
                res.send();
            }
        )
    }

    function addFlowReport(req, res, next) {
        console.log(req.body);
        const sensorList = ["flow1", "flow2", "flow3", "flow4", "flow5"];
        req.body.idVector = idVector;
        db.oneOrNone('select * FROM createFlowReport(${id_box}, ${isCalibration}', req.body)
            .then(function (data) {
                let idReport = data.idFReport;
                let cont = 1;
                sensorList.forEach(function (sensor) {
                    let sensorData = {
                        idReport: idReport,
                        idSensor: cont,
                        value: req.body[sensor]
                    };
                    db.none('select * FROM addFSensor(${idSensor}, ${idReport}, ${value}, ${value})', sensorData).then(
                        function (data) {
                            console.log(sensor + " added");
                        }
                    )
                    cont++;
                });
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Flow Report Inserted'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }


    function addTempReport(req, res, next) {
        console.log(req.body);
        const sensorList = ["temperature1", "temperature2", "temperature3", "temperature4", "temperature5"];
        db.oneOrNone('select * FROM createTemperatureRegister()', req.body)
            .then(function (data) {
                let idReport = data.createtemperatureregister;
                let cont = 1;
                sensorList.forEach(function (sensor) {
                    let sensorData = {
                        idReport: idReport,
                        idSensor: cont,
                        value: req.body[sensor]
                    };
                    db.oneOrNone('select * FROM addTemperature(${idReport}, ${idSensor}, ${value})', sensorData).then(
                        function (data) {
                            console.log(sensor + " added");
                        }
                    )
                    cont++;
                });
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Temperature Report Inserted'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }

//Queries de Dispositivos
    function getFlowBoxes(req, res, next) {
        db.any('select * from getFlowBoxes()')
            .then(function (data) {
                console.log(data);
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Flow Boxes Retrieved Successfully'
                    });

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving Flow Boxes'
                    });
                return next(err);
            })
    }

    function getHumidityBoxes(req, res, next) {
        let json = [];
        db.any('select * from getHumidityBoxes()')
            .then(function (data) {
                for (let i = 0; i < data.length; i++) {
                    json.push(data[i])
                    json[i].idbox = data[i].idhumiditybox;
                }
                console.log(data);
                res.status(200)
                    .json({
                        status: 'success',
                        data: json,
                        message: 'Humidity Boxes Retrieved Successfully'
                    });

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving Humidity Boxes'
                    });
                return next(err);
            })
    }

    function getFlowBox(req, res, next) {
        var Device = req.params.idBox;
        db.one('select * from getFlowBox ($1)', [Device])
            .then(function (data) {
                console.log(data);
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Box Retrieved Successfully'
                    });

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving Box'
                    });
                return next(err);
            });
    }

    function getHumidityBox(req, res, next) {
        var Device = req.params.idBox;
        let json = {};
        db.one('select * from getHumidityBox ($1)', [Device])
            .then(function (data) {
                json = data;
                json.idbox = data.idhumiditybox;
                console.log(data);
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Box Retrieved Successfully'
                    });

            })
            .catch(function (err) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'Error retrieving Box'
                    });
                return next(err);
            });
    }

    function modifyFlowBox(req, res, next) {
        console.log(req.body);
        db.any('select updateFBoxLocation(${idBox}, ${name},${location}, ${latlong})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Box Modified'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }

    function modifyHumidityBox(req, res, next) {
        console.log(req.body);
        db.any('select updateHBoxLocation(${idBox}, ${name},${location}, ${latlong})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Box Modified'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }

    function addFlowBox(req, res, next) {
        console.log(req.body);
        db.any('select createFlowBox(${idBox}, ${name},${location}, ${latlong})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Box Added'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }

    function addHumidityBox(req, res, next) {
        console.log(req.body);
        db.any('select createHumidityBox(${idBox}, ${name}, ${location}, ${latlong})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Box Added'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }


    function getFlowValue(req, res, next) {
        const idDevice = req.params.idDevice;
        const socket = devices[idDevice];
        socket.emit('Command', "Flow");
        // Messaged Received
        if (devices[idDevice]){
            socket.on('Result', function (msg) {
                console.log(msg);
                const timestamp = new Date().toISOString();
                const jsonStr = {timestamp, message: `Solicitud de flujo  enviado al dispositivo: ${idDevice} `, deviceId: devices[idDevice].deviceId, socketId: socket.id };
                writeToJsonFile(jsonStr);
                res.status(200)
                    .json({
                        status: 'success',
                        data: msg
                    });
                socket.removeAllListeners("Result")
            });
        }
        else{
            const jsonStr = {timestamp, message: `Error enviando solicitud de flujo. Socket no existe. ` };
                    writeToJsonFile(jsonStr);
            res.status(504)
                .json({
                    status: 'Error, no se pudo comunicar con la caja'
                })
        }
        
    }

    function setRelays(req, res, next) {
        const idDevice = req.params.idDevice;
        let command = req.params.command;
        let id = req.params.id;
        let send = `relay,${command},${id}`;
        let maxRetries = 5; // Número máximo de intentos
        let retryDelay = 5000; // Tiempo en milisegundos entre intentos
        let attempt = 0;
        let responded = false; // Bandera para evitar múltiples respuestas
    
        function sendCommand() {
            // Actualiza el socket en cada intento para verificar que sea el correcto
            const socket = devices[idDevice];
    
            if (socket) {
                try {
                    socket.emit("Command", send);
                    console.log(`Intentando enviar comando al dispositivo ${idDevice}, intento #${attempt + 1}`);
                } catch (error) {
                    console.error("Error al intentar enviar el comando:", error);
                }
    
                // Establece un temporizador para escuchar la respuesta del socket
                const timeout = setTimeout(() => {
                    attempt++;
                    if (attempt < maxRetries && !responded) {
                        console.log(`No se recibió respuesta. Reintentando... (${attempt + 1}/${maxRetries})`);
                        sendCommand(); // Reintenta enviando el comando
                    } else if (!responded) {
                        console.log("No se pudo obtener respuesta del dispositivo después de varios intentos.");
                        responded = true; // Marcar como respondido
                        res.status(504).json({
                            status: 'Error, no se pudo comunicar con la electrovalvula después de varios intentos'
                        });
                    }
                }, retryDelay);
    
                // Elimina el listener previo antes de agregar uno nuevo para evitar duplicados
                socket.removeAllListeners("RelayResult");
    
                // Escucha la respuesta del socket
                socket.on('RelayResult', function (msg) {
                    if (!responded) {
                        clearTimeout(timeout); // Cancela el temporizador si se recibe respuesta
                        responded = true; // Marcar como respondido
                        console.log(msg);
                        const timestamp = new Date().toISOString();
                        const jsonStr = {
                            timestamp,
                            message: `Comando ${command} enviado al relay ${id}`,
                            deviceId: idDevice,
                            socketId: socket.id
                        };
                        writeToJsonFile(jsonStr);
    
                        res.status(200).json({
                            status: 'success',
                            data: msg
                        });
    
                        // Limpia el listener después de obtener la respuesta para evitar duplicación
                        socket.removeAllListeners("RelayResult");
                    }
                });
            } else if (!responded) {
                const jsonStr = { timestamp: new Date().toISOString(), message: `Error enviando comando al relay. Socket no existe.` };
                writeToJsonFile(jsonStr);
                responded = true; // Marcar como respondido
                res.status(504).json({
                    status: 'Error, no se pudo comunicar con la electrovalvula'
                });
            }
        }
    
        sendCommand(); // Inicia el envío del comando con la lógica de reintento
    }

    function getHumiditySockets(req, res, next) {
        const idDevice = req.params.idDevice;
        const socket = devices[idDevice];
        let idBox = req.params.idBox;
        let send = `humidity,${idBox}`;
        socket.emit("Command", send);
        if(devices[idDevice]){
            socket.on('HumidityResult', function (msg) {
                console.log(msg);
                if (msg !== "Error") {
                    const timestamp = new Date().toISOString();
                    const jsonStr = {timestamp, message: `Solicitud de humedad  enviado al dispositivo: ${idDevice} `, deviceId: devices[idDevice].deviceId, socketId: socket.id };
                    writeToJsonFile(jsonStr);
                    res.status(200)
                        .json({
                            status: 'success',
                            data: msg
                        });
                } else {
                    res.status(504)
                        .json({
                            status: 'Error, no se pudo comunicar con la caja'
                        })
                }
                socket.removeAllListeners("HumidityResult")
            });
        }
        else{
            const jsonStr = {timestamp, message: `Error enviando solicitud de humedad. Socket no existe. ` };
                    writeToJsonFile(jsonStr);
            res.status(504)
                .json({
                    status: 'Error, no se pudo comunicar con la caja'
                })
        }
    }

    function writeToJsonFile(data) {
        console.log(data);
        data = JSON.stringify(data) + ',\n';
        fs.appendFile('sockets.txt', data, 'utf8', function (err){
            if (err) throw err;
        });
    }

    //Call function every hour
    setInterval(latestHumReport, 3600000);
    //setInterval(latestHumReport, 10000);
    return {
        test: testConnection,
        login: login,
        modifyUser: modifyUser,
        addUser: addUser,
        getLastFlowReport: getLastFlowReport,
        getLastHumidityReport: getLastHumidityReport,
        getFlowReports: getFlowReports,
        getHumidityReports: getHumidityReports,
        addFlowReport: addFlowReport,
        addHumidityReport: addHumidityReport,
        getFlowBoxes: getFlowBoxes,
        getHumidityBoxes: getHumidityBoxes,
        getFlowBox: getFlowBox,
        getHumidityBox: getHumidityBox,
        modifyFlowBox: modifyFlowBox,
        modifyHumidityBox: modifyHumidityBox,
        addFlowBox: addFlowBox,
        addHumidityBox: addHumidityBox,
        getFlowValue: getFlowValue,
        setRelays: setRelays,
        getHumiditySockets: getHumiditySockets,
        testCalibration: testCalibration,
        addTempReport: addTempReport,
        getLastTemperatureReport: getLastTemperatureReport,
        getHumidityReport: getHumidityReport,
        getTemperatureReports: getTemperatureReports
    }

}
