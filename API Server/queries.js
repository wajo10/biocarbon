const axios = require('axios');
var promise = require('bluebird');
var socket = undefined;

var options = {
    // Initialization Options
    promiseLib: promise
};


var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:admin@localhost:5432/Biocarbon';
var db = pgp(connectionString);

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
    db.any('select addUser(${username}, ${name}, ${firstlastname}, ${secondlastname}, ${email}, ${phonenumber}, ${password})', req.body)
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
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Data Retrieved Successfully'
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
    db.one('select * from lastHumidityReport ($1)', [Device])
        .then(function (data) {
            console.log(Device);
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Data Retrieved Successfully'
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
                    return (humidity * -1.04 * 10 ** -5 + 0.5490385053)*100
                case "sensor2":
                    return (humidity ** 2 * (-5.25*10**-10) + humidity * -0.000006634669025 + 0.497670979917851) * 100
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
                    return (humidity * -1.10174*10**-5 + 0.595417119) * 100
                case "sensor2":
                    return (humidity * -1.11861*10**-5 + 0.600855136) * 100
                case "sensor3":
                    return (humidity * -1.15001*10**-5 + 0.60810348) * 100
                case "sensor4":
                    return (humidity * -1.12847*10**-5 + 0.600972855) * 100
                case "sensor5":
                    return (humidity * -1.10816*10**-5 + 0.596240066) * 100
            }
            break;
        case "D":
            switch (sensor) {
                case "sensor1":
                    return (humidity**2 * 2.93517*10**-10 + humidity * -3.01968*10**-5 + 0.759721201) * 100
                case "sensor2":
                    return (humidity * -1.36917*10**-5 + 0.552279556) * 100
                case "sensor3":
                    return (humidity**2 * 2.7399*10**-10 + humidity * -2.91479*10**-5 + 0.750961815) * 100
                case "sensor4":
                    return (humidity**2 * 3.83927*10**-10 + humidity * -3.47601*10**-5 + 0.807306733) * 100
                case "sensor5":
                    return (humidity**2 * 2.76591*10**-10 + humidity * -2.8983*10**-5 + 0.74058965) * 100
            }
            break;
        case "E":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.46*10**-5 + 0.609739931) * 100
                case "sensor2":
                    return (humidity * -1.22*10**-5 + 0.534813136) * 100
                case "sensor3":
                    return (humidity * -1.26*10**-5 + 0.530505067) * 100
                case "sensor4":
                    return (humidity * -1.26*10**-5 + 0.53926531) * 100
                case "sensor5":
                    return (humidity * -1.56*10**-5 + 0.633281353) * 100
            }
            break;
        case "F":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.27*10**-5 + 0.549830707) * 100
                case "sensor2":
                    return (humidity * -1.22*10**-5 + 0.534813136) * 100
                case "sensor3":
                    return (humidity * -1.26*10**-5 + 0.530505067) * 100
                case "sensor4":
                    return (humidity * -1.26*10**-5 + 0.53926531) * 100
                case "sensor5":
                    return (humidity * -1.36*10**-5 + 0.577679645) * 100
            }
            break;
        case "G":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.27*10**-5 + 0.699489284) * 100
                case "sensor2":
                    return (humidity * -1.14*10**-5 + 0.628862633) * 100
                case "sensor3":
                    return (humidity * -1.12*10**-5 + 0.603404268) * 100
                case "sensor4":
                    return (humidity * -1.15*10**-5 + 0.619652078) * 100
                case "sensor5":
                    return (humidity * -1.13*10**-5 + 0.614141697) * 100
            }
            break;
        case "H":
            switch (sensor) {
                case "sensor1":
                    return (humidity**2 * -1.06086*10**-10 + humidity * -3.09656*10**-6 + 0.47794214) * 100
                case "sensor2":
                    return (humidity**2 * -8.357060326*10**-11 + humidity * -8.357060326312*10**-6 + 0.52392936) * 100
                case "sensor3":
                    return (humidity * -1.10*10**-5 + 0.608424121) * 100
                case "sensor4":
                    return (humidity**2 * -1.10195*10**-10 + humidity * -3.36567*10**-6 + 0.487629326) * 100
                case "sensor5":
                    return (humidity * -1.13*10**-5 + 0.618206743) * 100
            }
            break;
        case "I":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.15 * 10 ** -5 + 0.641237294) * 100
                case "sensor2":
                    return (humidity * -1.09 * 10 ** -5 + 0.623007069) * 100
                case "sensor3":
                    return (humidity * -1.15 * 10 ** -5 + 0.638748074) * 100
                case "sensor4":
                    return (humidity * -1.11 * 10 ** -5 + 0.619053942) * 100
                case "sensor5":
                    return (humidity * -1.09 * 10 ** -5 + 0.623656148) * 100
            }
            break;
        case "J":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.09 * 10 ** -5 + 0.604190104) * 100
                case "sensor2":
                    return (humidity**2 * -3.94002*10**-10 + humidity * 1.83578* 10 ** -5 + 0.101911457) * 100
                case "sensor3":
                    return (humidity * -1.20 * 10 ** -5 + 0.64301529) * 100
                case "sensor4":
                    return (humidity * -1.16 * 10 ** -5 + 0.623303599) * 100
                case "sensor5":
                    return (humidity * -1.14 * 10 ** -5 + 0.621482561) * 100
            }
            break;
        case "K":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.17 * 10 ** -5 + 0.628211751) * 100
                case "sensor2":
                    return (humidity * -1.20 * 10 ** -5 + 0.641137812) * 100
                case "sensor3":
                    return (humidity * -1.14 * 10 ** -5 + 0.61139367) * 100
                case "sensor4":
                    return (humidity * -1.22 * 10 ** -5 + 0.649539673) * 100
                case "sensor5":
                    return (humidity * -1.18 * 10 ** -5 + 0.641128534) * 100
            }
            break;
        case "L":
            switch (sensor) {
                case "sensor1":
                    return (humidity**2 * 1.77171*10**-10 + humidity * -2.51224 *10**-5 + 0.862682349) * 100
                case "sensor2":
                    return (humidity * -1.10*10**-5 + 0.58643562) * 100
                case "sensor3":
                    return (humidity * -1.11*10**-5 + 0.60684) * 100
                case "sensor4":
                    return (humidity * -1.11*10**-5 + 0.61408658) * 100
                case "sensor5":
                    return (humidity * -1.08*10**-5 + 0.59681926) * 100
            }
            break;
        case "M":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -9.37*10**-5 + 0.515605196) * 100
                case "sensor2":
                    return (humidity * 5.89*10**-5 + 0.413214459) * 100
                case "sensor3":
                    return (humidity * -1.07*10**-5 + 0.574816305) * 100
                case "sensor4":
                    return (humidity * -1.11*10**-5 + 0.591193426) * 100
                case "sensor5":
                    return (humidity * -1.15*10**-5 + 0.602978282) * 100
            }
            break;
        case "N":
            switch (sensor) {
                case "sensor1":
                    return (humidity**2 * 3.42273*10**-11 + humidity * -1.40554*10**-5 + 0.646676012) * 100
                case "sensor2":
                    return (humidity ** 2 * -2.70*10**-11 + humidity * -9.4120*10**-6 + 0.567549956) * 100
                case "sensor3":
                    return (humidity * -1.171*10**-5 + 0.609592875) * 100
                case "sensor4":
                    return (humidity**2 * 8.41*10**-11 + humidity * -1.797*10**-5 + 0.722431475) * 100
                case "sensor5":
                    return (humidity * -1.445*10**-5 + 0.604259511) * 100
            }
            break;
        case "O":
            switch (sensor) {
                case "sensor1":
                    return (humidity * -1.07*10**-5 + 0.572205038) * 100
                case "sensor2":
                    return (humidity ** 2 * 2.21556*10**-10 + humidity * -2.68537*10**-5 + 0.837211929) * 100
                case "sensor3":
                    return (humidity * -1.07*10**-5 + 0.570846192) * 100
                case "sensor4":
                    return (humidity * -1.07*10**-5 + 0.570131514) * 100
                case "sensor5":
                    return (humidity * -1.10*10**-5 + 0.578774467) * 100
            }

    }
}

function testCalibration(req, res, next){
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

function getHumidityReports(req, res, next) {
    db.any('select * from getHumidityReports(${idbox},${fromdate},${todate}, ${iscalibration})', req.body)
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


//Function to round date to nearest 5 minutes
function roundDate(date) {
    let dateRounded = new Date(date);
    date = new Date(date);
    dateRounded.setMinutes(Math.round(date.getMinutes() / 5) * 5);
    dateRounded.setSeconds(0);
    return dateRounded;
}

function generateTimeVector(timestamp) {
    let idVector = null;
    return new Promise(resolve => db.one('select * from addTimeVector($1)', [timestamp]).then(
            function (data) {
                idVector = data.addtimevector;
                resolve(idVector);
            }
        )
    );
}

function getTimeVector(timestamp) {
    // Verificar si ya existe el vector de tiempo
    let idVector = null;
    return new Promise(resolve => db.one('select * from getTimeVector($1)', [timestamp]).then(
            async function (data) {
                console.log(data);
                if (data.idtime != null) {
                    idVector = data.idtime;
                    resolve(idVector);
                } else {
                    // Genera un nuevo vector de tiempo
                    generateTimeVector(timestamp).then(function (idVector) {
                            resolve(idVector);
                        }
                    );
                }
            }
        )
    )
}

async function addHumidityReport(req, res, next) {
    console.log(req.body);
    const timestamp = roundDate(req.body.created_at);
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
    getTimeVector(timestamp).then(function (idVector) {
        req.body.idVector = idVector;
        db.any('select addHumidityReport(${id_box}, ${created_at}, ${sensorA}, ${rawSensorA}, ${sensorB},' +
            '${rawSensorB}, ${sensorC}, ${rawSensorC},${sensorD},${rawSensorD}, ${sensorE}, ${rawSensorE}, ' +
            '${isCalibration}, ${idVector})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Humidity Report Inserted'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    });
}

function addFlowReport(req, res, next) {
    console.log(req.body);
    const timestamp = roundDate(req.body.created_at);
    getTimeVector(timestamp).then(function (idVector) {
        req.body.idVector = idVector;
        db.any('select addFlowReport(${id_box}, ${created_at}, ${flow1}, ${flow2}, ${flow3}, ${flow4}, ${flow5},' +
            ' ${isCalibration}, ${idVector})', req.body)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Flow Report Inserted'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
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
    db.any('select * from getHumidityBoxes()')
        .then(function (data) {
            console.log(data);
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
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
    db.one('select * from getHumidityBox ($1)', [Device])
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

function modifyFlowBox(req, res, next) {
    console.log(req.body);
    db.any('select modifyFlowBox(${idBox}, ${name},${location})', req.body)
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
    db.any('select modifyHumidityBox(${idBox}, ${name},${location})', req.body)
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
    db.any('select addFlowBox(${idBox}, ${name},${location})', req.body)
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
    db.any('select addHumidityBox(${idBox}, ${name},${location})', req.body)
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

function updateSock(sock) {
    socket = sock;
}

function getFlowValue(req, res, next) {
    socket.emit('Command', "Flow");
    // Messaged Received
    socket.on('Result', function (msg) {
        console.log(msg);
        res.status(200)
            .json({
                status: 'success',
                data: msg
            });
        socket.removeAllListeners("Result")
    });
}

function setRelays(req, res, next) {
    let command = req.params.command;
    let id = req.params.id;
    let send = `relay,${command},${id}`;
    socket.emit("Command", send);
    socket.on('RelayResult', function (msg) {
        console.log(msg);
        res.status(200)
            .json({
                status: 'success',
                data: msg
            });
        socket.removeAllListeners("RelayResult")
    });
}

function getHumiditySockets(req, res, next) {
    let idBox = req.params.idBox;
    let send = `humidity,${idBox}`;
    socket.emit("Command", send);
    socket.on('HumidityResult', function (msg) {
        console.log(msg);
        if (msg !== "Error") {
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


module.exports = {
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
    updateSock: updateSock,
    setRelays: setRelays,
    getHumiditySockets: getHumiditySockets,
    testCalibration: testCalibration
};
