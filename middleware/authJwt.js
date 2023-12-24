const jwt = require("jsonwebtoken");
const config = require("../config/db.config");

auth = async (req, res, next) => {
    let token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
   
    jwt.verify(token,
              config.jwtSecretKey,
              (err, decoded) => {
                if (err) {
                  return res.status(401).send({
                    message: "Unauthorized!",
                  });
                }
                next();
              });
  };

const authJwt = {
  auth
}

module.exports = authJwt;