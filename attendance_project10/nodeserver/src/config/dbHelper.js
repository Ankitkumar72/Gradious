const mysql = require('mysql');
const dbconfig = require("../modal/dbConfig.json");
const constants = require('../modal/constants');

let pool;
let phase = process.env.LAMBDA_ENV;
if (phase == constants.LAMBDA_ENV.PROD) {
    pool = mysql.createPool(dbconfig.prod);
}
else if (phase == constants.LAMBDA_ENV.QA) {
    pool = mysql.createPool(dbconfig.aws_dev);
}
else {
    pool = mysql.createPool(dbconfig.dev);
    pool.getConnection(
        (err) => {
            if (err) {
                console.log("Error", err);
            }
        },
        (connection) => {
            console.log("connection", connection);
        }
    );
}


module.exports = pool;