const config = require("../config/db.config");
const fb = require("../db");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const setPass = async (doc, pass) => {
    res = await doc.update({
        'password': bcrypt.hashSync(pass, 8)});
    return;
}

exports.signup = async (req, res) => {
    const user = db.collection('users').doc(req.body.email);
    if (req.body.password) {
        await setPass(user, req.body.password)
        console.log(`${req.body.email} registered`);
        res.send({ message: "User was registered successfully!"});
        return
    }
    else {
        res.status(400).send({message: "No password!"})
    }
    
}


exports.auth = async (req, res) => {
    try {
        console.log(`${req.body.email} trying to Auth`);
        const user = await db.collection('users').doc(req.body.email).get();

        if (user.exists) {
            const data = user.data()
            const validPass = bcrypt.compareSync(req.body.password, data.password)

            if (!validPass) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Bad Password!"
                });
            }

            const token = jwt.sign({ email: req.body.email },
                config.jwtSecretKey,
                {
                  algorithm: 'HS256',
                  allowInsecureKeySizes: true,
                  expiresIn: 86400, // 24 hours
            });

            console.log(`${req.body.email} successful Auth`);
            res.status(200).send({
                email: req.body.email,
                accessToken: token,
                memberId: data.memberId,
                otherMembers: data.other_members
            })


        }
        else {
            return res.status(401).send({
                accessToken: null,
                message: "User does not exist!"
                });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}

exports.test = (req, res) => {
    return res.status(200).send({
        message: "Successfully authenticated"
    })
}