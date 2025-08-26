const express = require("express");
const router = express.Router();

const marketController = require("../controllers/marketController");
// const upload = require("../middlewares/upload");
// const verifyToken = require("../middlewares/authMiddleware");

router.get("/items", marketController.getItems);
router.get("/items/:item_id",marketController.getOneItem);
router.post("/market/purchase", marketController.purchaseItem);

module.exports = router;

