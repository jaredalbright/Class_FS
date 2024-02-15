const { authJwt } = require("../middleware");
const controller = require("../controllers/event.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.post(
      "/api/events/auth",
      [authJwt.auth],
      controller.auth
    );

    app.get(
      "/api/events/events",
      [authJwt.auth],
      controller.events
    );
  
    app.get(
      "/api/events/userEvents",
      [authJwt.auth],
      controller.userEvents
    );

    app.post(
      "/api/events/addUserEvent",
      [authJwt.auth],
      controller.addEvent
    );

    app.put(
      "/api/events/updateUserEvent",
      [authJwt.auth],
      controller.updateEvent
    );

    app.delete(
      "/api/events/removeUserEvent",
      [authJwt.auth],
      controller.removeEvent
    );
};