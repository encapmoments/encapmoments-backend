const express = require("express");
const router = express.Router();

const marketController = require("../controllers/marketController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/items", marketController.getItems);
router.get("/items/:item_id",marketController.getOneItem);
router.post("/market/purchase", verifyToken, marketController.purchaseItem);
router.get("/me", verifyToken, marketController.getMyPurchases);
router.patch("/use/:user_reward_id", verifyToken, marketController.useGifticon);

module.exports = router;


