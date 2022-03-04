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
    axios.get("htttp://172.21.134.44:3032/api/biocarbon/test")
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
