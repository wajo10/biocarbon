var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:admin@localhost:5432/cosecha_agua';
var db = pgp(connectionString);

//Queries de Usuarios
function testConnection(req, res, next) {
    console.log("Test Connection");
    res.status(200)
        .json({
            status: 'success',
            data: "Connection Established, This is RASPBIAN",
            message: 'Data Retrieved Successfully'
        });
}




module.exports = {
    test:testConnection
};
