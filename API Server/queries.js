var promise = require('bluebird');
const {google} = require("googleapis");
var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:admin@localhost:5432/cosecha_agua';
var db = pgp(connectionString);

//Queries de Usuarios




module.exports = {
};
