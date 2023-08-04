let connection = require("../config/dbHelper");
let utils = require("./utils");
let constants = require("../modal/constants");

function createBatch(event) {
    return new Promise((resolve, reject) => {
        return (async () => {
            console.log("batch hittttttttttttttt");
            try {
                var data;
                if (typeof event.body === "string") {
                    data = JSON.parse(event.body);
                }
                else {
                    data = event.body;
                }
                var userName;
                if (event.headers.authorization == undefined) {
                    userName = utils.getLoggedInUserName(event.headers.Authorization);
                } else {
                    userName = utils.getLoggedInUserName(event.headers.authorization);
                }

                var name = data.name;
                var description = data.description;
                var startDate = data.startDate;
                var endDate = data.endDate;
                var status = data.status;
                var learningpathid = data.learningpathid;
                var batchimage = data.batchimage;
                let batchquery = "insert into batch (name,description,startdate,status,thumbnail,createdby) values ('" + name + "'," + JSON.stringify(description) + ",'" + startDate + "','" + status + "','" + batchimage + "','" + userName + "')";

                console.log("in try");
                var result = await utils.dbquery(batchquery);
                var batchid = result.insertId;

/* If trainer adding batch */

                if(data.hasOwnProperty("trainerid")){
                    let addbatchuserquery = `insert into batchuser (batchid,userid) values (`+ batchid +`,`+ data.trainerid +`)`;
                    var addbatchuser = await utils.dbquery(addbatchuserquery);
                }


                console.log("batch id insert is    ", batchid);

                    resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": { "batchid": batchid,'emailBody':data.emailBody } });


                // return batchid

            }
            catch (err) {
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
                // return err.message;
            }
        })()
    })
}


function getBatchByUserID(data) {
    let query = "select * from batch where id in (select batchid from batchuser where userid=" + parseInt(data) + ")";
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
                //reject(err);
            };
            resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": result });
            //resolve(result);
        })
    })
}

function getBatches() {
    let query = "select * from batch";
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                reject(err);
            };
            resolve(JSON.stringify(result));
        })
    })
}

function getBatchDetailsByBatchId(batchid) {
    console.log("batchid", batchid)
    var query = `select * from batch where id=${batchid} `;
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            console.log('query', query);
            if (err) {
                console.log(err);
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
                //reject(err);
            };
            // console.log({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": result });
            resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": result });
            //resolve(result);
        })
    })
}

function updateBatchThumbnail(data) {
    var jsonData;
    if (typeof data.body === "string") {
        jsonData = JSON.parse(data.body);
    }
    else {
        jsonData = data.body;
    }

    let batchid = jsonData.batchid;
    let imagedata = jsonData.newimage

    var query = "UPDATE batch SET thumbnail ='" + imagedata + "' WHERE id=" + parseInt(batchid)
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
                //reject(err);
            };
            console.log({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": result });
            resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": result });
            //resolve(result);
        })
    })
}


module.exports = {
    createBatch: createBatch,
    getBatches: getBatches,
    getBatchByUserID: getBatchByUserID,
    getBatchDetailsByBatchId: getBatchDetailsByBatchId,
    updateBatchThumbnail: updateBatchThumbnail
}
