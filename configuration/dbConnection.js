const mongoose = require("mongoose");

function dbConnection() {
  mongoose
    .connect("mongodb+srv://muntasiralamresti_db_user:%40muntasir04@cluster0.lbrhouv.mongodb.net/administration?appName=Cluster0")
    .then(function () {
      console.log("Database connected successfully");
    })
    .catch(function (error) {
      console.log("Database connection error:", error);
    });
}

module.exports = dbConnection;
