const express = require("express");

const router = express();
const port = 3031;
var db = require('./queries');
var path = require('path');
var cookieParser = require('cookie-parser');


router.listen(port, () => {
    console.log("El servidor está inicializado en el puerto: ", port);

});

router.set('views', path.join(__dirname, 'views'));
router.set('view engine', 'jade');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(express.static(path.join(__dirname, 'public')));

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

router.get('/api/biocarbon/test', db.test);
router.get('/api/biocarbon/login/:User/:Password', db.login);
router.put('/api/biocarbon/User/', db.modifyUser);
router.post('/api/biocarbon/Users/', db.addUser);
router.get('/api/biocarbon/LastFlow/:idBox', db.getLastFlowReport);
router.get('/api/biocarbon/LastHumidity/:idBox', db.getLastHumidityReport);
router.put('/api/biocarbon/FlowReports/', db.getFlowReports);
router.put('/api/biocarbon/HumidityReports/', db.getHumidityReports);
router.post('/api/biocarbon/FlowReport/', db.addFlowReport);
router.post('/api/biocarbon/HumidityReport/', db.addHumidityReport);
router.get('/api/biocarbon/FlowBoxes/', db.getFlowBoxes);
router.get('/api/biocarbon/HumidityBoxes/', db.getHumidityBoxes);
router.get('/api/biocarbon/FlowBox/:idBox', db.getFlowBox);
router.get('/api/biocarbon/HumidityBox/:idBox', db.getHumidityBox);
router.put('/api/biocarbon/HumiditySettings/', db.modifyHumidityBox);
router.put('/api/biocarbon/FlowSettings/', db.modifyFlowBox);
router.post('/api/cosecha/FlowBox/', db.addFlowBox);
router.post('/api/cosecha/HumidityBox/', db.addHumidityBox);

router.get('/', async (req, res) => {

    res.render('index', {title: 'BioCarbon Server'}); // load the single view file (angular will handle the page changes on the front-end)

});
module.exports = router;
