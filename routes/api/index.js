const express = require("express");
const router = express.Router();


const authRoute =  require("./authRoute.js")
const dashboardRoute = require("./dashboardRoute.js")
const taskRoute = require("./taskRoute.js")

router.use("/auth", authRoute)
router.use("/dashboard", dashboardRoute)
router.use("/task", taskRoute)


module.exports = router;   