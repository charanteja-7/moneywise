const express = require("express");
const {
  addAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
} = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addAccount);
router.put("/", authMiddleware, updateAccount);
router.delete("/:accountId", authMiddleware, deleteAccount);
router.get("/", authMiddleware, getAccounts);

module.exports = router; // Ensure the router is exported
