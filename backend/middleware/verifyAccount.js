const db = require("../db");

const getUser = async (doc) => {
    const user = await doc.get();

    if (user.exists && !("password" in user.data())) {
        return true;
    }
    else {
        return false;
    }
}

checkValidAccount = async (req, res, next) => {
    if (req.body.email) {
        try {
            const user = db.collection('users').doc(req.body.email);
            if (await getUser(user)) {
                next();
                return;
            }
            else {
                res.status(400).send({ message: "Failed! Contact Admin" });
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send({ message: "Failed! Bad input" });
        }
    }
    else {
        res.status(400).send({ message: "Failed! No Email!" });
    }
}

checkLogin = async (req, res, next) => {
    try {
        if (req.body.email && req.body.password) {
            next();
            return;
        }
        else {
            res.status(400).send({ message: "Failed! Bad input"});
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}

const accountChecks = {
    checkValidAccount,
    checkLogin
}


module.exports = accountChecks;