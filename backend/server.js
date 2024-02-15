const express = require("express");
const cors = require("cors");

const app = express();

const corsOrigin = process.env.ORIGIN || "http://localhost";

var corsOptions = {
  origin: corsOrigin
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('./routes/auth.routes')(app);
require('./routes/event.routes')(app);

// simple route
app.get("/health", (req, res) => {
  res.json({ message: "Health Check" });
});

// set port, listen for requests
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});