const { authJwt, accountChecks } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.post(
        "/api/auth/signup",
        [accountChecks.checkValidAccount],
        controller.signup
      );
  
    app.post(
      "/api/auth/signin",
      [accountChecks.checkLogin],
      controller.auth
    );

    app.get(
        "/api/auth/test",
        [authJwt.auth],
        controller.test
    )
};