const Transaction = require("../models/Transaction");
const User = require("../models/User");

const addTransaction = async (req, res) => {
  try {
    const { userId, accountId, amount, type, category, description, date } = req.body;

    // Validate the user and account
    const user = await User.findById(userId);
   
    if (!user) return res.status(404).json({ message: "User not found" });

    const accountIndex = user.accounts.findIndex((acc) => acc._id.toString() === accountId);
    if (accountIndex === -1) return res.status(404).json({ message: "Account not found" });

    // Adjust account balance based on transaction type
    if (type === "debit" || type === "to_take") {
      if (user.accounts[accountIndex].balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.accounts[accountIndex].balance -= amount;
    } else if (type === "credit" || type === "to_give") {
      user.accounts[accountIndex].balance += amount;
    }

    // Save the transaction
    const transaction = new Transaction({
      userId,
      accountId,
      amount,
      type,
      category,
      description,
      date,
    });
    await transaction.save();

    // Save the updated user
    await user.save();

    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateTransaction = async (req, res) => {
  try {
    const { transactionId, userId, accountId, amount, type, category, description, date } = req.body;

    // Validate the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the transaction to be updated
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Check if the transaction belongs to the specified user and account
    if (transaction.userId.toString() !== userId) {
      return res.status(403).json({ message: "You cannot update this transaction" });
    }

    const accountIndex = user.accounts.findIndex((acc) => acc._id.toString() === accountId);
    if (accountIndex === -1) return res.status(404).json({ message: "Account not found" });

    // Store the original amount and type to revert the balance adjustment
    const originalAmount = transaction.amount;
    const originalType = transaction.type;

    // Revert the previous balance adjustment
    if (originalType === "debit" || originalType === "to_take") {
      user.accounts[accountIndex].balance += originalAmount;  // Undo previous deduction
    } else if (originalType === "credit" || originalType === "to_give") {
      user.accounts[accountIndex].balance -= originalAmount;  // Undo previous addition
    }

    // Update the transaction fields
    transaction.amount = amount;
    transaction.type = type;
    transaction.category = category;
    transaction.description = description;
    transaction.date = date;

    // Adjust the account balance based on the updated transaction type and amount
    if (type === "debit" || type === "to_take") {
      if (user.accounts[accountIndex].balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.accounts[accountIndex].balance -= amount;  // Deduct the new amount
    } else if (type === "credit" || type === "to_give") {
      user.accounts[accountIndex].balance += amount;  // Add the new amount
    }

    // Save the updated transaction and user
    await transaction.save();
    await user.save();

    res.status(200).json({ message: "Transaction updated successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
  
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const user = await User.findById(transaction.userId);
    const accountIndex = user.accounts.findIndex(
      (acc) => acc._id.toString() === transaction.accountId.toString()
    );

    // Reverse the balance adjustment
    if (transaction.type === "debit" || transaction.type === "to_take") {
      user.accounts[accountIndex].balance += transaction.amount;
    } else if (transaction.type === "credit" || transaction.type === "to_give") {
      user.accounts[accountIndex].balance -= transaction.amount;
    }

    // Save the updated user and delete the transaction
    await user.save();
    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//getting transactions by account id
const getTransactionsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params; 
     
    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    const filter = { accountId };

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { addTransaction, deleteTransaction,getTransactionsByAccountId,updateTransaction };
