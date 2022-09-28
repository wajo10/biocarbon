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
        .then(res=>{
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
            for (let i = 0; i < data.length; i++){
                let dataJSON = JSON.stringify(data[i]);
                dataJSON = JSON.parse(dataJSON);
                let value = dataJSON[Sensor];
                arrayValues.push(value);
                mean = value + mean;
            }
            arrayValues.sort(function(a, b){return b-a});
            let median = (arrayValues[4] + arrayValues[5])/2;
            mean = mean/10;
            let variance = 0;

            for (let i = 0; i < data.length; i++) variance = variance + Math.pow(arrayValues[i] - mean, 2);
            variance = variance/10;

            let stDev = Math.sqrt(variance);
            let zscore = (Data - median)/stDev;
            if (Math.abs(zscore) < 2)isgood = "1";
            else isgood ="0";

            let retValue =`Median: ${median}, Standard Deviation: ${stDev}, ZScore: ${zscore} isGood: ${isgood}`;
            console.log(retValue);
            console.log(arrayValues);

            resolve(isgood);
        }))
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

function addFlowReport(req, res, next) {
    console.log(req.body);
    db.any('select addFlowReport(${id_box}, ${created_at}, ${flow1}, ${flow2}, ${flow3}, ${flow4}, ${flow5}, ${isCalibration})', req.body)
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
}

async function addHumidityReport(req, res, next) {
    console.log(req.body);
    let sensors = ["sensorA", "sensorB", "sensorC", "sensorD", "sensorE"];
    let isGood = "";
    for (let i = 0; i < sensors.length; i++) {
        let sensor = sensors[i];
        let temp = await filtro(req.body.id_box, sensors[i], req.body[sensor]);
        isGood = temp + isGood;
    }
    req.body.isGood = isGood;
    db.any('select addHumidityReport(${id_box}, ${created_at}, ${sensorA}, ${sensorB}, ${sensorC}, ${sensorD}, ${sensorE}, ${isCalibration}, ${isGood})', req.body)
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
}

//Queries de Dispositivos
function getFlowBoxes(req, res, next){
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
function getHumidityBoxes(req, res, next){
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

function getFlowBox(req, res, next){
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
function getHumidityBox(req, res, next){
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

function getFlowValue(req,res,next){
    socket.emit('Command',"Flow");
    // Messaged Received
    socket.on('Result', function(msg) {
        console.log(msg);
        res.status(200)
            .json({
                status: 'success',
                data: msg
            });
        socket.removeAllListeners("Result")
    });
}

function setRelays(req,res,next){
    let command =  req.params.command;
    let id =  req.params.id;
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

function getHumiditySockets(req, res, next){
    let idBox = req.params.idBox;
    let send = `humidity,${idBox}`;
    socket.emit("Command", send);
    socket.on('HumidityResult', function (msg) {
        console.log(msg);
        if (msg !== "Error"){
            res.status(200)
                .json({
                    status: 'success',
                    data: msg
                });
        }
        else{
            res.status(504)
                .json({
                    status: 'Error, no se pudo comunicar con la caja'
                })
        }
        socket.removeAllListeners("HumidityResult")
    });
}



module.exports = {
    test:testConnection,
    login: login,
    modifyUser: modifyUser,
    addUser: addUser,
    getLastFlowReport: getLastFlowReport,
    getLastHumidityReport: getLastHumidityReport,
    getFlowReports: getFlowReports,
    getHumidityReports: getHumidityReports,
    addFlowReport:addFlowReport,
    addHumidityReport:addHumidityReport,
    getFlowBoxes:getFlowBoxes,
    getHumidityBoxes:getHumidityBoxes,
    getFlowBox:getFlowBox,
    getHumidityBox:getHumidityBox,
    modifyFlowBox: modifyFlowBox,
    modifyHumidityBox: modifyHumidityBox,
    addFlowBox:addFlowBox,
    addHumidityBox:addHumidityBox,
    getFlowValue:getFlowValue,
    updateSock:updateSock,
    setRelays:setRelays,
    getHumiditySockets: getHumiditySockets

};
