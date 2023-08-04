const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const formidable = require("formidable");
const fs=require('fs');
const corsOptions = require('./src/config/corsOptions');
const credentials = require('./src/middleware/credentials');
const auth = require('./src/controllers/auth');
const validateSession=require('./src/middleware/validateSession');
const batch = require('./src/controllers/batch');
const batchUser = require('./src/controllers/batchuser');

require('dotenv').config();

app.use(bodyParser.json());
app.use(credentials);
app.use(cors(corsOptions));


const port = process.env.PORT || 3001

console.log(process.env.SECRET)
app.post('/api/node/auth/validate', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/auth/validate::", req.body);
            const finalResult = await auth.googleUserAuth(req.body.credentials);
            if (finalResult == "") {
                body = "no user with mailid "
            } else {
                body = finalResult;
            }
            console.log("RESULT:" + JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        }
        finally {
            res.send(body);
        }
    })();
});

app.post('/api/node/auth/logout', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/auth/logout::");
            const finalResult = await auth.logout(req.body);
            body = finalResult
        }
        catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        } finally {
            res.send(body);
        }
    })();
});

app.use(validateSession.validateSession);

//getBatches
app.get('/api/node/admin/batch/get', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/admin/batch/get::", req.body);
            body = await batch.getBatches(req.body);
            // console.log("RESULT:"+JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        }
        finally {
            res.send(body);
        }
    })();
})


//getBatchByUserId(/api/node/learner/batch/{id})
app.get('/api/node/learner/batch/:id', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/learner/batch/:id::", req.body);
            let userid = req.params.id;
            body = await batch.getBatchByUserID(userid);
            // console.log("RESULT:"+JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = err;
            // body = {"message":err};
        }
        finally {
            res.send(body);
        }
    })();
})

app.post('/api/node/admin/batch/userviacsv', (req, res) => {
    var body;
    return (async () => {
        try {
            console.log("HIT /api/node/admin/batch/userviacsv::");
            const form = new formidable.IncomingForm();
            form.parse(req, async (err, fields, files) => {
                console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", fields);
                var from = fields.from;
                console.log("##############################################################################", files);
                if (err) {
                    body = { msg: "parsing the form" }
                }
                if (from[0] === 'addnewbatch') {
                    let parsedbatchData = JSON.parse(fields.batchdata)
                    console.log(parsedbatchData.hasOwnProperty('user'))
                    if (parsedbatchData.hasOwnProperty('user') && parsedbatchData.user !== "") {
                        console.log("IIIIIInnnnnnnnnnn csv check api")
                        var oldPath = files.csv[0].filepath;
                        console.log(oldPath,typeof oldPath)
                        fs.readFile(oldPath, 'utf8', async (err, data) => {
                            var filedata = data;
                            if (err) {
                                return ("error in reading the file")
                            }
                            try {
                                body = await batchUser.uploadUsersfiletoServer(filedata, from, { body: parsedbatchData, headers: req.headers });
                                res.send(body)
                            } catch (err) {
                                res.send(err)
                            }
                        })

                    } else {
                        console.log("IIIIIInnnnnnnnnnn batch api without csv")
                        try {
                            body = await batch.createBatch({ body: parsedbatchData, headers: req.headers })
                            res.send(body)
                        } catch (err) {
                            res.send(err)
                        }
                    }
                } else {
                    var oldPath = files.csv[0].filepath;
                    fs.readFile(oldPath, 'utf8', async (err, data) => {
                        var filedata = data;
                        if (err) {
                            return ("error in reading the file")
                        }
                        try {
                            body = await batchUser.uploadUsersfiletoServer(filedata, from, { id: fields.batchid, emailBody: fields.emailBody, headers: req.headers });
                            res.send(body)
                        } catch (err) {
                            res.send(err)
                        }
                    })
                }

            })
        } catch (err) {
            body = err;
            res.send(body)
        }

    })();
})

//getBatchDetailsByBatchId
app.get('/api/node/admin/batch/:id', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/admin/batch/:id::", req.body);
            let batchid = req.params.id;
            body = await batch.getBatchDetailsByBatchId(batchid);
            // console.log("RESULT:"+JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        }
        finally {
            res.send(body);
        }
    })();
})

//updateBatchThumbnail
app.post('/api/node/admin/batch/updatethumbnail', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/admin/batch/updatethumbnail::");
            body = await batch.updateBatchThumbnail(req);
            console.log("RESULT:" + JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        }
        finally {
            res.send(body);
        }
    })();
})


app.post('/api/node/admin/user/get', (req, res) => {
    return (async () => {
      try {
        console.log("HIT /api/node/admin/user/get::",req.body);
        body = await batchUser.checkEmailforUser(req);
        console.log("RESULT:"+JSON.stringify(body));
       
      } catch (err) {
        console.log("Error:"+err)
        body = {"message":err};
      }
      finally{
        res.send(body);
      }
    })();
  })

app.post('/api/node/admin/batch/user/add', (req, res) => {
    return (async () => {
        try {
            console.log("HIT /api/node/admin/batch/user/add::", req.body);
            body = await batchUser.addSingleUser(req);
            console.log("RESULT:" + JSON.stringify(body));

        } catch (err) {
            console.log("Error:" + err)
            body = { "message": err };
        }
        finally {
            res.send(body);
        }
    })();
})


app.listen(port, () =>
    console.log(`Server is listening on port ${port}.`)
)