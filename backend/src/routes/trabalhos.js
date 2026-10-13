const express = require("express");
const router = express.Router();
const controller = require("../controllers/trabalhoController");

router.get("/exportar", controller.exportarPDF);
router.post("/", controller.cadastrar);
router.get("/", controller.buscar);

module.exports = router;
