const express = require("express");
const router = express.Router();
const controller = require("../controllers/trabalhoController");

router.get("/exportar", controller.exportarPDF);
router.post("/", controller.cadastrar);
router.get("/", controller.buscar);
router.get("/:id", controller.buscarPorId);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
