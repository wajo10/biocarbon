const express = require("express");

const router = express();
const port = 3032;
var db = require('./queries');
var path = require('path');
var cookieParser = require('cookie-parser');
const axios = require('axios');

router.listen(port, () => {
    console.log("El servidor está inicializado en el puerto: ", port);
    axios.get("htttp://201.207.53.225:3031/api/biocarbon/test")
        .then(res=>{
            console.log(`statusCode: ${res.status}`);
            console.log(res);
        })
        .catch(error => {
            console.error(error);
        });
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

router.get('/', async (req, res) => {

    res.render('index', {title: 'BioCarbon Rasp'}); // load the single view file (angular will handle the page changes on the front-end)

});
module.exports = router;
