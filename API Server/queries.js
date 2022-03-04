const axios = require('axios');
var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);

//Queries de Usuarios
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



module.exports = {
    test:testConnection
};
