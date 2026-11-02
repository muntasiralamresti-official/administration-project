const express = require("express");
const router = express.Router();


const authRoute =  require("./authRoute.js")
const dashboardRoute = require("./dashboardRoute.js")


router.use("/auth", authRoute)
router.use("/dashboard", dashboardRoute)



module.exports = router;   