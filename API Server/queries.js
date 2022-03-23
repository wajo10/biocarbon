const axios = require('axios');
var promise = require('bluebird');
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
    axios.get("http://172.21.60.139:3033/api/biocarbon/test")
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

function addHumidityReport(req, res, next) {
    console.log(req.body);
    db.any('select addHumidityReport(${id_box}, ${created_at}, ${sensorA}, ${sensorB}, ${sensorC}, ${sensorD}, ${sensorE}, ${isCalibration})', req.body)
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
    var Device = req.params.idDevice;
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
    var Device = req.params.idDevice;
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
    addHumidityBox:addHumidityBox
};
