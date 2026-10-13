const express = require("express");
const controller = require("../controllers/authController");
const autenticar = require("../middleware/autenticar");

const router = express.Router();

router.post("/cadastro", controller.cadastrar);
router.post("/login", controller.entrar);
router.get("/me", autenticar, controller.sessao);

module.exports = router;