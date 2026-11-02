require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("node:dns");
const dbConnection = require("./configuration/dbConnection.js");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 8000;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

app.use(cors());
app.use(express.json());

// connect database
dbConnection();

// all routes
app.use(routes);
app.use("/uploads", express.static("uploads"));

app.get("/", function (req, res) {
  res.send("Administration Server is Running");
});

app.listen(PORT, function () {
  console.log("Server is running on port " + PORT);
});
