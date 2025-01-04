const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["credit", "debit", "to_take", "to_give"], required: true },
  category: { type: String, enum: ["food", "transport", "housing","health","entertainment","other"], required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
