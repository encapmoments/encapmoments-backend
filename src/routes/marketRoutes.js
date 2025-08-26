const express = require("express");
const router = express.Router();

const marketController = require("../controllers/marketController");
// const upload = require("../middlewares/upload");
// const verifyToken = require("../middlewares/authMiddleware");

router.get("/items", marketController.getItems);
router.get("/items/:item_id",marketController.getOneItem);
router.post("/market/purchase", marketController.purchaseItem);
router.get("/me", verifyToken, marketController.getMyPurchases);
router.get("/use/:user_reward_id", verifyToken, marketController.useGifticon);

module.exports = router;