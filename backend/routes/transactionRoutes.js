const express = require("express");
const {
  addTransaction,
  deleteTransaction,
  getTransactionsByAccountId,
  updateTransaction,
} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, addTransaction);
router.get('/:accountId', authMiddleware, getTransactionsByAccountId);
router.delete("/:id", authMiddleware, deleteTransaction);
router.put("/", authMiddleware, updateTransaction);

module.exports = router;
