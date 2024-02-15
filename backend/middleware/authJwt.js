const jwt = require("jsonwebtoken");
const { get_secret } = require("../gcp_services/firebase.service");

auth = async (req, res, next) => {
    let token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
    
    // TODO change to 1 API call
    const jwtSecretKey = await get_secret();
    jwt.verify(token,
          jwtSecretKey,
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