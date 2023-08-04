const connection = require("../config/dbHelper");

function dbquery(query) {
    console.log("in db query " + query)
    return new Promise((resolve, reject) => {
        // console.log("%%%%%%%%%%%%%%%%%%dbquery%%%%%%%%%%%%%%%%%%%%%%%%"+query);
        connection.query(query, function (err, result) {
            if (err) {
                console.log("%%%%%%%%%%%%%%%%%%dbquery ERR %%%%%%%%%%%%%%%%%%%%%%%%" + err);
                reject(err);
            };
            // console.log("%%%%%%%%%%%%%%%%%%dbquer RESy%%%%%%%%%%%%%%%%%%%%%%%%"+JSON.stringify(result));

            resolve(result);
        })
    })
}


function getLoggedInUserName(authToken) {
    try {
        let decoded = jwt.verify(authToken, ACCESS_TOKEN_SECRET);
        console.log("::decoded authToken::" + JSON.stringify(decoded));
        return decoded.name;
    } catch (err) {
        console.log(":::getLoggedInUserName err", JSON.stringify(err));
        return null;
    }
}

module.exports = {
    dbquery: dbquery,
    getLoggedInUserName:getLoggedInUserName
}