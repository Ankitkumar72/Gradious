const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const connection = require("../config/dbHelper");
const utils = require('./utils');

// const CLIENT_ID = process.env.CLIENT_ID
// const ACCESS_TOKEN_SECRET = process.env.SECRET




function userAuthorization(mailId) {
    return new Promise((resolve, reject) => {
        try {
            let finalResult
            let query = `select json_object('id',id,'firstname',firstname,'lastname',lastname,'lastlogin',lastlogin,'role',role,'registered',registered) as userobject from user where email=${JSON.stringify(mailId)} and status=1`;
            connection.query(query, function (err, result) {
                if (err) {
                   
                    reject(err);
                    console.log(err)
                }
                console.log(result)
                if (result) {
                    finalResult = JSON.parse(result[0].userobject);
                    console.log("finalResult", finalResult)
                    resolve(finalResult);

                } else {
                   
                    reject('email id does not exist');
                }
            })
        } catch (error) {
           
            reject(error);
        }
    })

}

function GenerateSessionToken(result, payload) {
    return new Promise((resolve, reject) => {
        try {
            const user = {
                role: result.role,
                name: payload['name'],
                picture: payload['picture'],
                learnerid: result.id,
                lastlogin: result.lastlogin,
                registered: result.registered,
            }
            mailId = payload['email'];
            console.log("userInfo", user)
            const accessToken = jwt.sign(user, process.env.SECRET, { expiresIn: '1d' });
            // res.json({accessToken:accessToken});
            console.log('accessToken', accessToken, "result", result);
            let timeStampQuery
            if (result.lastlogin !== null) timeStampQuery = `UPDATE user SET sessiontoken="` + accessToken + `" ,lastlogin=now() WHERE email=${JSON.stringify(mailId)}`;
            else if ((result.firstname == "" || result.firstname == null || result.firstname == undefined) && (result.lastname == "" || result.lastname == null || result.lastname == undefined)) timeStampQuery = `UPDATE user SET sessiontoken="` + accessToken + `" ,lastlogin=now(),firstname='${payload['given_name']}',lastname='${payload['family_name']}' WHERE email=${JSON.stringify(mailId)}`;
            else if (result.firstname == "" || result.firstname == null || result.firstname == undefined) timeStampQuery = `UPDATE user SET sessiontoken="` + accessToken + `" ,lastlogin=now(),firstname='${payload['given_name']}' WHERE email=${JSON.stringify(mailId)}`;
            else if (result.lastname == "" || result.lastname == null || result.lastname == undefined) timeStampQuery = `UPDATE user SET sessiontoken="` + accessToken + `" ,lastlogin=now(),lastname='${payload['family_name']}' WHERE email=${JSON.stringify(mailId)}`;
            else timeStampQuery = `UPDATE user SET sessiontoken="` + accessToken + `" ,lastlogin=now() WHERE email=${JSON.stringify(mailId)}`;
            console.log("timeStampQuery", timeStampQuery)
            connection.query(timeStampQuery, function (err, result1) {
                if (err) {
                    console.log(err);
                    
                    reject(err)
                }

                console.log(" new time stamp and access token", result1);
                resolve(JSON.stringify({ accessToken: accessToken }))

            })
        } catch (error) {
            console.log("catch error ", error)
            reject(error);
        }
    })
}

function googleUserAuth(token) {
    console.log("client id ",process.env.CLIENT_ID);
    console.log("token ", token);
    return new Promise((resolve, reject) => {
        const client = new OAuth2Client(process.env.CLIENT_ID);
        async function verify() {
            console.log("before calling verifyIdToken")
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience:process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            console.log(payload);
            let mailid = payload['email'];
            console.log('mail', mailid)
            userAuthorization(mailid)
                .then((result) => {
                    console.log(result)
                    resolve(GenerateSessionToken(result, payload));
                })
                .catch((result) => {
                    console.log("error", result)
                    reject(result);
                })

        }
        verify().catch((err) => {
            console.log("&&&&&&&&&", err)
            console.log(err);
            reject("Error in verifying google token");

        });
    })

}

function logout(data) {
    return new Promise((resolve, reject) => {
        try {
         
            let deleteTokenQuery = `UPDATE user SET sessiontoken=""  WHERE id=${data.userId}`;

            connection.query(deleteTokenQuery, function (err, result1) {
                if (err) {
                    console.log(err);
                    
                    reject(err)
                }
               
                resolve("Logged out")
            })
        } catch (error) {
            console.log("catch error ", error)
            reject(error);
        }
    });
}


module.exports = {
    googleUserAuth: googleUserAuth,
    logout:logout
}