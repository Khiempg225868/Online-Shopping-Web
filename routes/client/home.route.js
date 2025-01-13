const express = require("express");
const { index } = require("../../controllers/client/home.controller");
const router = express.Router();

const controller = require("../../controllers/client/home.controller");

router.get("/", controller.index);

module.exports = router;
