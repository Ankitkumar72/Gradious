let connection = require("../config/dbHelper");
let utils = require("./utils");
let constants = require("../modal/constants");
const path = require('path');
const fs = require('fs');
let batch = require("./batch");
var _ = require('lodash');
let nodemailer = require('nodemailer');
// let smtpTransport = require('nodemailer-smtp-transport');
let sesAccessKey = 'gradious.lms@gmail.com';
let sesSecretKey = 'afbyhfyxzpclmxdn';

let smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: sesAccessKey,
        pass: sesSecretKey
    }
});


async function CreateBatchUser(data) {
    var batchId = data.batchId;
    var userId = data.userid;
    console.log("batch id is ", batchId, " userid    ", userId);
    let query = "insert into batchuser (batchid,userid) values(" + parseInt(batchId) + "," + parseInt(userId) + ")";
    var checkInBatch = await checkIfUserExistsInBatch(userId, batchId)
    if (checkInBatch == false) {
        return new Promise((resolve, reject) => {
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                };
                console.log("999999999999999999999999999999999999999999999999999999999999999999999999999999999");
                console.log(result);
                resolve("Candidate inserted successfully in batchid " + batchId);
            })
        })
    }
    else {
        return checkInBatch;
    }
}

function getUsersByBatchid(data) {
    var batchId = data.batchId;

    let query = "select userid from batchuser where batchid=" + batchId + "";
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                reject(err);
            };
            resolve(result);
        })
    })

}

function getBatchByUserID(data) {
    var userId = data.userId;

    let query = `select * from batch where batchid IN
   )( select batchid from batchuser where userid=`+ userId + `)`;
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                reject(err);
            };
            resolve(result);
        })
    })

}


function checkDuplicateForCandidateCSV(lines, batchidin) {
    var batchid = batchidin;
    var values = [];
    var batchuser = [];
    var errorFound = 0;
    var result = ""
    console.log("lines", lines)
    return new Promise((resolve, reject) => {
        console.log("##########################3       ", lines.length);
        // var columns = lines[0].split(",").length;
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", columns);
        for (var i = 1; i < lines.length - 1; i++) {
            let CandidateData = {};
            result = "";
            var isplit = lines[i].split(",");
            console.log("isplit   before  -----   " + isplit);
            if (isplit.length == 1) {
                console.log("inside isSplit length ==1")
                break;
            }
            CandidateData.firstname = isplit[0].trim();
            if (CandidateData.firstname !== "" && CandidateData.firstname !== undefined && CandidateData.firstname !== null) result = utils.checkNameFeild(isplit[0].trim(), result);
            // console.log("firstname    "+CandidateData.firstname);
            CandidateData.lastname = isplit[1].trim();
            if (CandidateData.lastname !== "" && CandidateData.lastname !== undefined && CandidateData.lastname !== null) result = utils.checkNameFeild(isplit[1].trim(), result);
            console.log("check name result", result)
            // CandidateData.lastlogin = isplit[2];
            // result = utils.checkNameFeild(isplit[2], result);

            // CandidateData.status = isplit[3].trim();
            // result = utils.checkNumber(isplit[3], result,1);
            // console.log("check status result",result)

            CandidateData.email = isplit[2].trim();
            result = utils.checkEmailfeild(isplit[2].trim(), result);
            console.log("check email result", result)

            CandidateData.phone = isplit[3].trim();
            // if( CandidateData.phone!==""&& CandidateData.phone!==undefined&& CandidateData.phone!==null)
            // result = utils.checkPhoneNumber(isplit[3].trim(), result);
            console.log("check number result", result)

            // CandidateData.role = isplit[5].trim();
            // result = utils.checkNameFeild(isplit[5], result);
            // console.log("check role result",result)

            // CandidateData.remarks = removeEscapes(isplit[6]).trim();
            // result = utils.checkNameFeild(CandidateData.remarks,result);
            // console.log("check remarks result",result)


            // if (
            //   lines[i][lines[i].length - 1] == "\r" ||
            //   lines[i][lines[i].length - 1] == "\n"
            // ) {
            //   lines[i] = lines[i].substring(0, lines[i].length - 1);
            // }
            lines[i] = removeEscapes(lines[i]);

            console.log("lines-xxxxxxxxxx" + lines[i])

            if (result.length > 0) {
                errorFound = 1;
                lines[i] = lines[i] + "," + result;
            }
            console.log("nnnnnnnnnn    ", lines[i]);

            for (var j = i + 1; j < lines.length; j++) {
                var jsplit = lines[j].split(",");

                if (isplit[2] == jsplit[2]) {
                    if (
                        lines[j][lines[j].length - 1] == "\r" ||
                        lines[j][lines[j].length - 1] == "\n"
                    ) {
                        lines[j] = lines[j].substring(0, lines[j].length - 1);
                    }
                    if (lines[j][lines[j].length - 1] == ",") {
                        lines[j] = lines[j] + " duplicate email";
                        errorFound = 1;
                    } else {
                        lines[j] = lines[j] + ", duplicate email";
                        errorFound = 1;
                    }
                }


                console.log("llllllllll", lines[j]);
            }




        }

        console.log("rrrrrrrrrr  ", lines, "rrrrrrrrrr   ", typeof lines);

        if (errorFound == 0) {
            console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");

            resolve("success")
        }

        if (errorFound == 1) {

            console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
            writedata = lines.join("\n");
            reject({ filedata: writedata });

        }


    });


}


async function checkIfUserExists(useremail) {
    var query = "select id from user where email=\"" + useremail + "\"";
    var result = await utils.dbquery(query);
    console.log("result", result)
    if (result.length >= 1) {
        return { userid: result[0].id, msg: "Candidate already Exists" };
    } else {
        return false
    }

}

function removeEscapes(name) {
    console.log("xxcxxc", typeof name, "ccxccx   ", name);
    if ((name[name.length - 1] == "\r") || (name[name.length - 1] == "\n")) {
        return removeEscapes(name.substring(0, name.length - 1));
    } else {
        return name;
    }

}


function sendMailToUser(mail) {
    console.log("mail", mail);
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mail, function (error, response) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log("Message sent: " + JSON.stringify(response));
                resolve(response);
            }

            smtpTransport.close();
        });
    })
}



function fetchMailIdsSendInvite(userIds, emailBody) {
    console.log("tttttttttttttttttttttttttt", userIds);
    return new Promise((resolve, reject) => {
        return (async () => {
            let count = 0;
            try {

                const users = await fetchEmail(userIds);
                console.log("calling sendEmailInvitations" + JSON.stringify(users));
                let result = await sendEmailInvitations(users, emailBody);
                resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "Emails send successfully to all candidates" });
            } catch (err) {
                console.log("***********", err)
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "data": err.message });
            }
        })()
        //  for(let i=0;i<users.length;i++){

        //     count++;
        //   console.log("////////////////////",count ," ;;;;",i,":::::",   users.length)
        //     console.log("After sendEmailInvitations for "+users[i].name + JSON.stringify(result));
        //  } 
        //  if(count==users.length){
        //   console.log("((((((((((((((((((((((")
        //   resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg":"Emails send successfully to all candidates" });
        //  }




    });
}

function fetchEmail(userIds) {
    var sql;

    return new Promise((resolve, reject) => {
        var USERS = [];
        try {

            sql = `SELECT u.firstname, u.email FROM user u where u.id in ( ${userIds})`;

            console.log(" query: " + sql);


            connection.query(sql, function (err, result) {
                if (err) {
                    console.log("error in executing query: " + err.message);
                    reject(err.message);
                } else {
                    console.log("fetchEmail :: Result" + JSON.stringify(result));
                    for (let i = 0; i < result.length; i++) {
                        var row = {};
                        // row.firstName = result[i].firstname;
                        // row.emailAddress = result[i].email;
                        row.name = result[i].firstname;
                        row.address = result[i].email;
                        USERS.push(row);
                    }
                    resolve(USERS);
                }
            });
        } catch (err) {
            reject(err.message);
        }
    });
}


const sendEmailInvitations = async (users, emailBody) => {
    return new Promise((resolve, reject) => {
        return (async () => {
            let emailPromiseArray = [];
            const year = new Date().getFullYear();

            for (let user = 0; user < users.length; user++) {

                emailPromiseArray.push(
                    sendMailToUser({
                        from: 'gradious.lms@gmail.com',
                        to: users[user].address,
                        // bcc:'vishnu.m@gradious.com',
                        subject: 'Invite to the Gradious LMS Platform',
                        // text:users[user].email,
                        html: `<div style= "margin: 0; padding: 0; minHeight: 100vh;
                width: 100%; box-sizing: border-box; display: flex; align-items: center;justify-content: center;font-family: 'Inter';"><div class="emailContainer" style=" background-color: #ffffff;border-color: #d6dee6;
                border-style: solid;border-width: 0px 1px 0px 1px; border-top:2px solid #f55533; ">
                      <h1 class="emailSender" style="margin: 20px 0 0 50px;font-size: 16px; font-weight: 700;line-height: 16px;color:#202124;">Gradious Technologies</h1>
                      <p class="emailReceiver" style=" margin: 20px 0 0 50px; font-size: 14px;font-weight: 500;line-height: 14px;
                      color:#202124;">Hi ${users[user].name},</p>
                      <div style="margin: 20px 10px 0 50px;width:70%;">${emailBody}</div>
                      <p class="emailInstruction" style=" margin-left: 50px; font-size: 14px; font-weight: 500;line-height: 22px;
                      color:#717A83;">Please click the button below to start learning</p>
                      <a class="emailLinBtn" href="https://leap.gradious.com"  style="text-decoration: none;
                      margin:20px 0 0px 50px; background: #fa7b00; padding: 10px;color: #ffffff;font-family: 'Inter';font-style: normal;
                      font-weight: 400; font-size: 14px;line-height: 20px; border-radius: 4px;
                      height: 38px;">Click here</a>
                      <p class="emailWishes" style="margin:20px 0 0 50px; font-style: normal;font-weight: 400;font-size: 14px; line-height: 20px;
                      color:#717A83;">Best wishes,</p>
                      <h4 class="emailWishesBy" style="margin: 5px 0 0 50px; padding: 0;color:#202124;">Gradious Technologies</h4>
                      <div class="emailFooter" style=" margin-top: 40px; background: #f1f4f7; padding: 10px;text-align: center; border-bottom: 1px solid #6f6f6f;">
                          <p class="emailfooterContent" style=" font-style: normal; font-weight: 400;font-size: 14px;line-height: 20px;
                          color: #6f6f6f;"> &copy; ${year}, Gradious Technologies Pvt.Ltd. All Rights Reserved.</p>
                      </div>
                    </div></div>`
                    })
                )
            }

            console.log("emailPromiseArray", emailPromiseArray)
            Promise.all(emailPromiseArray).then((result) => {
                resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "Emails send successfully to all candidates" });
            }).catch((error) => {
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "data": error.message });
            })
        })();
    });
};

const addSingleUser = async (req) => {
    var userData;
    if (typeof req.body === "string") {
        userData = JSON.parse(req.body);
    }
    else {
        userData = req.body;
    }

    console.log("userData.batchid   ", userData.batchid);
    var userName, userId;
    if (req.headers.authorization == undefined) {
        userName = utils.getLoggedInUserName(req.headers.Authorization);
    } else {
        userName = utils.getLoggedInUserName(req.headers.authorization);
    }
    let existEmail = "select * from user where email='" + userData.email + "'";
    var existEmailResult = await utils.dbquery(existEmail);
    if (existEmailResult.length == 1) {
        try {
            userId = existEmailResult[0].id;
            let existEmailquery2 = "INSERT INTO batchuser(batchid,userid) VALUES (" + userData.batchid + "," + existEmailResult[0].id + ") "
            var finalResult = await utils.dbquery(existEmailquery2)
            var sendEmailToUserResult = await fetchMailIdsSendInvite(existEmailResult[0].id, userData.emailBody)
            console.log("FINAL...........", finalResult);
            return ({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": "User Added Successfully" });
        }
        catch (err) {
            //return("2050");
            return ({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message })
        }
        // return ({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": "User Added Successfully" });


    }
    else {
        let query = "INSERT INTO user(firstname,lastname,email,status,mobile,role,createdby) VALUES ('" + userData.firstname + "','" + userData.lastname + "','" + userData.email + "','" + 1 + "','" + userData.mobile + "','" + userData.role + "','" + userName + "')";

        try {
            var userDataResult = await utils.dbquery(query)
            userId = userDataResult.insertId;
            let query2 = "INSERT INTO batchuser(batchid,userid) VALUES (" + userData.batchid + "," + userDataResult.insertId + ") "
            var finalResult = await utils.dbquery(query2)
            console.log("FINAL...........", finalResult);
            var sendEmailToUserResult = await fetchMailIdsSendInvite(userDataResult.insertId, userData.emailBody)
            console.log("sendEmailToUserResult...........", sendEmailToUserResult);
            return ({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": "User Added Successfully" });
        }
        catch (err) {
            //return("2050");
            return ({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message })
        }
    }

  

}



let uploadUsersfiletoServer = (filedata, from, batchdata) => {
    return new Promise((resolve, reject) => {
        console.log("result", filedata, from, batchdata)
        // try{
        // let result=await checkDuplicateForCandidateCSV(filedata.split("\n"));
        var lines = _.compact(filedata.split("\n"));
        checkDuplicateForCandidateCSV(lines).then((result) => {
            if (result == 'success') {
                console.log("excel file is ok", from)
                if (from == 'addnewbatch') {
                    // try{
                    var userName;
                    if (batchdata.headers.authorization == undefined) {
                        userName = utils.getLoggedInUserName(batchdata.headers.Authorization);
                    } else {
                        userName = utils.getLoggedInUserName(batchdata.headers.authorization);
                    }
                    console.log("fields data   " + batchdata);
                    batch.createBatch(batchdata).then((createbatchres) => {
                        console.log("createbatchres", createbatchres)
                        if (createbatchres.resultCode == 1000) {
                            let batchid = createbatchres.data.batchid
                            let emailBody = createbatchres.data.emailBody
                            if (Number.isInteger(batchid)) {
                                addUsers(lines, batchid, userName).then((addusersresult) => {
                                    console.log("result of add users is &&&&&&&&&&&&&&&&&&&&&&&", addusersresult);
                                    //  if(addusersresult.resultCode==1000&&addusersresult){
                                    // try{
                                    let userIds = addusersresult.data.length > 1 ? addusersresult.data.split(",") : [addusersresult.data];
                                    console.log("userIds", userIds)
                                    return (async () => {
                                        console.log("::::::::::::::: inside async function");

                                        try {


                                            console.log(" bbbbbbbbbb      ", userIds.length);
                                            let sentInviteResult = await fetchMailIdsSendInvite(addusersresult.data, emailBody)
                                            // if(sentInviteResult.resultCode==1000 &&sentInviteResult.data!==undefined){
                                            resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "Batch created successfully and users added", "filedata": addusersresult.filedata })
                                            // }else{
                                            //   reject( {"resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg":"Errors in send mail to user"})
                                            // }

                                        } catch (err) {
                                            console.log(":::::err", err);
                                            reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.msg })
                                        }
                                    })()

                                    // }catch(sentInviteError){
                                    //   reject( {"resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": sentInviteError})
                                    // }
                                    // }else{
                                    //   reject( {"resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg":"Errors in add user" })
                                    // }
                                }).catch((adduserserror) => {
                                    reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "Errors in add user" })
                                })
                            }
                            else {
                                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": createbatchres.msg })
                            }
                        } else {
                            reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": createbatchres.msg })
                        }
                        // }catch(err){
                        //   console.log("in create batch err",err)
                        //   reject(err)
                        // }

                    }).catch((createbatcherror) => {
                        console.log("createbatcherror", createbatcherror)
                        reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "Create Batch Error" })

                    })//create batch error

                }

                if (from == "uploadusersinsidebatch") {
                    let batchid = batchdata.id;
                    if (batchdata.headers.authorization == undefined) {
                        userName = utils.getLoggedInUserName(batchdata.headers.Authorization);
                    } else {
                        userName = utils.getLoggedInUserName(batchdata.headers.authorization);
                    }
                    //  try{  
                    addUsers(lines, batchid, userName).then((addusersresult) => {
                        console.log("result of add users is &&&&&&&&&&&&&&&&&&&&&&&", addusersresult);
                        //  if(addusersresult.resultCode==1000&&addusersresult){
                        var forfiledata = _.compact(filedata.split("\n"));
                        console.log(" -------------------------------------------------- ", forfiledata);
                        console.log("ioioioioio  ", lines, " ^^ ", typeof lines, " ^^ ", Array.isArray(lines));
                        console.log("ioioioioio  ", addusersresult.filedata, "  ^^  ", typeof addusersresult.filedata, " ^^ ", Array.isArray(addusersresult.filedata));

                        let userIds = addusersresult.data.length > 1 ? addusersresult.data.split(",") : [addusersresult.data];
                        console.log("userIds", userIds);

                        return (async () => {
                            console.log("::::::::::::::: inside async function");

                            try {


                                let sentInviteResult = await fetchMailIdsSendInvite(addusersresult.data, batchdata.emailBody)
                                // if(sentInviteResult.resultCode==1000 &&sentInviteResult.data!==undefined){
                                var forfiledata = _.compact(filedata.split("\n"));
                                forfiledata[0] = removeEscapes(forfiledata[0]) + ",Upload Remarks";

                                console.log("for file data ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", forfiledata, "@@@@",
                                    typeof forfiledata, "######", Array.isArray(forfiledata), "    length     ", forfiledata.length);

                                console.log("for addusersresult file data ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", addusersresult.filedata, "@@@@",
                                    typeof addusersresult.filedata, "######", Array.isArray(addusersresult.filedata), "    length     ", addusersresult.filedata.length);

                                for (var i = 1; i < forfiledata.length; i++) {

                                    console.log("&&&", forfiledata[i], "its type   ", typeof forfiledata[i]);


                                    forfiledata[i] = removeEscapes(forfiledata[i]) + ",--" + addusersresult.filedata[i - 1];
                                }
                                addusersresult.filedata = forfiledata;
                                console.log("==", forfiledata, "==", typeof addusersresult.filedata, " ^^ ", Array.isArray(addusersresult.filedata));

                                // resolve( {"resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "Users added successfully", "filedata":addusersresult.filedata.join("\n")})
                                resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "Users added successfully", "filedata": forfiledata.join("\n") })

                                // }else{
                                //   reject( {"resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg":"Errors in send mail to user"})
                                // }

                            } catch (err) {
                                console.log(":::::err", err);
                                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.msg })
                            }
                        })()
                    }).catch((adduserserror) => {
                        reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": adduserserror.msg })
                    })


                }



            } else {
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "Errors in csv file" })
            }

        }).catch((error) => {
            console.log("************************222222222222222222222222222222222222222*********************************");
            console.log("$$$$$$", error);
            // newPath = path.join(__dirname, '') + Date.now()+".csv";
            newPath = path.join(__dirname, '') + "batch.csv";
            fs.writeFile(newPath, error.filedata, (err) => {
                console.log("before writing error");
                if (err) {
                    // reject("error in writing the processed file")
                    console.log("it has error 666666666666666666666666666666666");
                    reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "Error in processing the file" })
                }
                else {
                    reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "The CSV file contains errors!", "filedata": error.filedata })
                }
            });

        })//check dublicates catch

        //  } catch(err)
        //   {
        //     console.log("555555555555555555555555555555555555555555555555555555555555555555555555");
        //     reject( {"resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg":"Errors in csv file", "filedata":err.filedata})
        //   }
    })

}


async function addUsers(lines, batchid, userName) {
    console.log("lines length in csvvvvvvvvvvvvvvvvvvvvvvvvvvv", lines.length);
    console.log("lines in csv", lines);
    var count = 0;
    return new Promise(async (resolve, reject) => {
        let userIds = ""
        var resultlines = [];
        // resultlines.push(lines[0]);

        for (var i = 1; i < lines.length; i++) {
            // resultlines.push(JSON.parse(JSON.stringify(lines[i])));
            console.log("vvvvvvvvvvv               ", lines[i]);
            let CandidateData = {};
            var isplit = lines[i].split(",");
            // if(isplit.length==1)
            // {
            //   break;
            // }
            CandidateData.firstname = isplit[0];
            CandidateData.lastname = isplit[1];
            // CandidateData.lastlogin = isplit[2];
            // CandidateData.status = isplit[3];
            CandidateData.email = isplit[2];
            CandidateData.phone = isplit[3];
            // CandidateData.role = isplit[5];
            // CandidateData.remarks = removeEscapes(isplit[6]);
            console.log("##########################  before remove escape   ", lines[i]);
            lines[i] = removeEscapes(lines[i]);
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$    after remove escape   ", lines[i]);
            try {
                var userExists = await checkIfUserExists(CandidateData.email);
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!       ", userExists);
                if (Number.isInteger(userExists.userid)) {
                    console.log("in ifffffffffffffffffffffffff~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", lines[i], " %% ", typeof lines[i]);

                    lines[i] = lines[i] + ", " + userExists.msg
                    console.log("user does not exist in batch ");
                    var CBUR = await CreateBatchUser({ batchId: batchid, userid: userExists.userid });
                    console.log("CBUR in userExists", CBUR)
                    count++;
                    if (typeof CBUR === 'string') {
                        resultlines.push(CBUR);
                        // lines[i]=lines[i]+", -- "+CBUR;
                        // lines[count]=lines[count]+", -- "+CBUR;
                    }

                    console.log("11111111111111111111111111111111111111111111111111", count);
                    if (count == lines.length - 1) {
                        userIds += userExists.userid
                        console.log("userIdsssssss", userIds)
                        //  resolve({"resultCode": constants.RESULT_STATUS.SUCCESS, "data": userIds,"filedata":lines.join("\n")})
                        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     ", resultlines.join("\n"));
                        resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": userIds, "filedata": resultlines })

                    }
                    userIds += userExists.userid + ","
                    console.log("wwwwwwwwww    ", userIds);

                } else {
                    lines[i] = lines[i] + ", " + userExists.msg;
                    console.log("in elseeeee~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", lines[i], "  %%  ", typeof lines[i, "ffff  ", userExists]);
                    console.log("in insert user after check email else" + JSON.stringify(CandidateData))
                    var values = []
                    values.push([CandidateData.firstname, CandidateData.lastname, CandidateData.email, 1, CandidateData.phone, 'learner', userName]);
                    var candidatequery = `INSERT INTO user (firstname,lastname,email,status,mobile,role,createdby) values ?`;

                    connection.query(candidatequery, [values], async (err, result2) => {
                        console.log("hhhhhhhhhh");
                        if (err) {
                            console.log(err);
                            console.log("candidates entry %%%%%%%%%%%%%%%%%%%%");
                            reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": "there are errors in candidate entry" });
                        }
                        console.log("22222222222222222222222222222222222222222222222", result2);

                        try {
                            var CBUR = await CreateBatchUser({ batchId: batchid, userid: result2.insertId });
                            console.log("CBUR in user not exists", CBUR, "  CBUR in user not exists  --", lines[i])
                            count++;
                            if (typeof CBUR === 'string') {
                                resultlines.push(CBUR);
                                // console.log("########################################  I is ", i);
                                console.log("popopopopopopopo   ", lines[i], "   yuyuyuyuyu   ", count);
                                // lines[i]=lines[i]+" -- "+CBUR;
                                // lines[count]=lines[count]+" -- "+CBUR;
                                // resultlines[count]=resultlines[count]+", -- "+CBUR;
                            }
                            // count++;
                            console.log("22222222222222222222222222222222222   ", count, "tttt     ", lines, "uuuu", lines.length - 1);
                            if (count == lines.length - 1) {
                                userIds += result2.insertId
                                console.log("userIds", userIds)
                                // resolve ({"resultCode": constants.RESULT_STATUS.SUCCESS, "data": userIds,"filedata":lines.join("\n")})
                                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     ", resultlines.join("\n"));

                                resolve({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": userIds, "filedata": resultlines })

                            }
                            userIds += result2.insertId + ","
                        } catch (err) {
                            reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
                        }

                    })
                }

            } catch (err) {
                reject({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message });
            };

        }
    })
}

async function checkIfUserExistsInBatch(userId, batchId) {
    var query = "select * from batchuser where userid=" + parseInt(userId) + " and batchid=" + parseInt(batchId) + "";
    var result = await utils.dbquery(query);
    console.log(result);

    if (result.length == 0) {
        return false;
    }
    else if ((result.length == 1) && (result[0].batchid == batchId)) {
        return " Candidate already exists in this batch";
    } else {
        var remark = "Candidate exists in other batch (";
        for (var i = 0; i < result.length; i++) {
            remark = remark + result[i].batchid + " and "
        }
        return remark.substring(0, remark.length - 4) + " ) -";
    }

}

const checkEmailforUser = async (req) => {
    console.log("req***********", req.body);
    console.log("jsonData*******************");
    var userData = req;
    if (typeof req.body === "string") {
        userData = JSON.parse(req.body);
    }
    else {
        userData = req.body;
    }


    let query = "select * from user where email='" + userData.email + "'";


    try {

        var userDataResult = await utils.dbquery(query);

        if (userDataResult.length == 1) {

            let query2 = "select * from batchuser where userid = " + userDataResult[0].id + " and batchid = " + userData.batchid + "";
            var batchUserResult = await utils.dbquery(query2);
            console.log("userDataResult[0].mobile ***** ", userDataResult[0])
            var jsonData = {
                id: userDataResult[0].id,
                role: userDataResult[0].role,
                firstname: userDataResult[0].firstname,
                lastname: userDataResult[0].lastname,
                mobile: userDataResult[0].mobile === "undefined" || userDataResult[0].mobile === "" ? "" : userDataResult[0].mobile,
                batchid: batchUserResult.length == 1 ? batchUserResult[0].batchid : null
            }
            console.log("jsonData*********", jsonData);
            return ({ "resultCode": constants.RESULT_STATUS.SUCCESS, "data": jsonData });
        }


        // return (jsonData);
        return ({ "resultCode": constants.RESULT_STATUS.SUCCESS, "msg": "no data", "data": null });
    }
    catch (err) {
        // return (err.message);
        return ({ "resultCode": constants.RESULT_STATUS.TECHNICAL_ERROR, "msg": err.message })

    }



}




module.exports = {
    getBatchByUserID: getBatchByUserID,
    getUsersByBatchid: getUsersByBatchid,
    CreateBatchUser: CreateBatchUser,
    fetchMailIdsSendInvite: fetchMailIdsSendInvite,
    addSingleUser: addSingleUser,
    checkEmailforUser: checkEmailforUser,
    uploadUsersfiletoServer: uploadUsersfiletoServer
}
