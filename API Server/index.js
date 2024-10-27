const express = require("express");

const router = express();
const port = 3031;
var path = require('path');
var cookieParser = require('cookie-parser');
const http = require('http').createServer(router);
var fs = require('fs');


let server = http.listen(port, () => {
    console.log("El servidor está inicializado en el puerto: ", port);
    fs.writeFile('sockets.txt', "", 'utf8', function (err){
        if(err){
            console.log(err);
        }
    });
});

let devices = {};

const queries = require('./queries')(devices);

// Sockets
const io = require('socket.io')(server, {
    allowEIO3: true
});

router.get('/', (req, res) => {
    res.status(200)
        .json({
            status: 'success',
            data: "Connection Established",
            message: 'Biocarbon Server '
        });
});

//Whenever someone connects this gets executed
io.on('connection', (socket) => {
    console.log('An user connected');

    socket.on('register', (data) => {
        const deviceId = data.deviceId;
        devices[deviceId] = socket;
        socket.deviceId = deviceId; // Almacena el deviceId en el socket
        const timestamp = new Date().toISOString()
        const jsonStr = {timestamp: timestamp, message: "Socket registrado", deviceId: deviceId, socketId: socket.id};
        writeToJsonFile(jsonStr);
        console.log(`Dispositivo ${deviceId} registrado`);
    });

    socket.on('disconnect', () => {
        const timestamp = new Date().toISOString();
        if (socket.deviceId && devices[socket.deviceId] && devices[socket.deviceId].id === socket.id) {
            const jsonStr = { timestamp: timestamp, message: "Socket desconectado", deviceId: socket.deviceId, socketId: socket.id };
            writeToJsonFile(jsonStr);
            delete devices[socket.deviceId];
            console.log(`Dispositivo ${socket.deviceId} desconectado y eliminado`);
    
            // Clear listeners from deleted socket
            socket.removeAllListeners("RelayResult");
            socket.removeAllListeners("Result");
            socket.removeAllListeners("HumidityResult");
        } else {
            const jsonStr = { timestamp: timestamp, message: `El socket con id ${socket.id} intentó desconectarse, pero no es el socket registrado.` };
            writeToJsonFile(jsonStr);
            console.log(`El socket con id ${socket.id} intentó desconectarse, pero no es el socket registrado.`);
        }
    });
});

function writeToJsonFile(data) {
    data = JSON.stringify(data) + ',\n';
    fs.appendFile('sockets.txt', data, 'utf8', function (err){
        if(err) {
            console.log(err);
        }
    });
}


router.set('views', path.join(__dirname, 'views'));
router.set('view engine', 'jade');

router.use(express.json());
router.use(express.urlencoded({extended: false}));
router.use(cookieParser());
router.use(express.static(path.join(__dirname, 'public')));

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

router.get('/api/biocarbon/test', queries.test);
router.get('/api/biocarbon/login/:User/:Password', queries.login);
router.put('/api/biocarbon/User/', queries.modifyUser);
router.post('/api/biocarbon/Users/', queries.addUser);
router.get('/api/biocarbon/LastFlow/:idBox', queries.getLastFlowReport);
router.get('/api/biocarbon/LastHumidity/:idBox', queries.getLastHumidityReport);
router.put('/api/biocarbon/FlowReports/', queries.getFlowReports);
router.put('/api/biocarbon/HumidityReports/', queries.getHumidityReports);
router.get('/api/biocarbon/HumidityReport/:report', queries.getHumidityReport);
router.post('/api/biocarbon/FlowReport/', queries.addFlowReport);
router.post('/api/biocarbon/TemperatureReport/', queries.addTempReport);
router.get('/api/biocarbon/LastTemperature/', queries.getLastTemperatureReport);
router.put('/api/biocarbon/TemperatureReports/', queries.getTemperatureReports);
router.post('/api/biocarbon/HumidityReport/', queries.addHumidityReport);
router.get('/api/biocarbon/FlowBoxes/', queries.getFlowBoxes);
router.get('/api/biocarbon/HumidityBoxes/', queries.getHumidityBoxes);
router.get('/api/biocarbon/FlowBox/:idBox', queries.getFlowBox);
router.get('/api/biocarbon/HumidityBox/:idBox', queries.getHumidityBox);
router.put('/api/biocarbon/HumiditySettings/', queries.modifyHumidityBox);
router.put('/api/biocarbon/FlowSettings/', queries.modifyFlowBox);
router.post('/api/biocarbon/FlowBox/', queries.addFlowBox);
router.post('/api/biocarbon/HumidityBox/', queries.addHumidityBox);
router.get('/api/biocarbon/Flow/:idDevice', queries.getFlowValue);
router.get('/api/biocarbon/Relays/:idDevice/:command/:id', queries.setRelays);
router.get('/api/biocarbon/HumidityRT/:idDevice/:idBox', queries.getHumiditySockets); // Humidity Real Time (Sockets)
router.get('/api/biocarbon/calibration/:box/:sensor/:humidity', queries.testCalibration);

router.get('/', async (req, res) => {

    res.render('index', {title: 'BioCarbon Server'}); // load the single view file (angular will handle the page changes on the front-end)

});
module.exports = {router};

