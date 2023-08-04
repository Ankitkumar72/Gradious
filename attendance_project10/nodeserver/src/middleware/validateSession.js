const jwt = require('jsonwebtoken');
function validateSession(req, res, next) {

    var authheader = req.headers.authorization;
    console.log("authheader", authheader)
    if (!authheader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
    const ACCESS_TOKEN_SECRET = process.env.SECRET
    if (req.path.includes("auth/validate")) {
        console.log("ALLOW");
        next();
    }
    else {
        jwt.verify(authheader, ACCESS_TOKEN_SECRET, (err, decoded) => {
            console.log("validateSession err", err)
            if (err) {
                var err = new Error('You are not authorized!');
                res.setHeader('WWW-Authenticate', 'Basic');
                err.status = 403;
                return next(err)
            }

            if (decoded.role == "superuser" || decoded.role == "admin" || req.path.includes("auth/logout") || req.path.includes(decoded.role)) {
                console.log("ALLOW");
                next();
            }

        });

    }
}

module.exports={validateSession:validateSession}