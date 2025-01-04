const User = require("../models/User");
const Transaction = require("../models/Transaction");

const addAccount = async (req, res) => {
  try {
    const { account_name, balance } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccount = {
      account_name,
      balance: balance || 0,
    };

    user.accounts.push(newAccount);
    await user.save();

    res.status(201).json({ message: "Account added successfully", accounts: user.accounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { accountId, account_name, balance } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const accountIndex = user.accounts.findIndex(
      (account) => account._id.toString() === accountId
    );
    if (accountIndex === -1) return res.status(404).json({ message: "Account not found" });

    // Update account details
    if (account_name !== undefined) user.accounts[accountIndex].account_name = account_name;
    if (balance !== undefined) user.accounts[accountIndex].balance = balance;

    await user.save();

    res.status(200).json({ 
      message: "Account details updated successfully", 
      accounts: user.accounts 
    });
  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const accountIndex = user.accounts.findIndex(
      (account) => account._id.toString() === accountId
    );
    if (accountIndex === -1) return res.status(404).json({ message: "Account not found" });

    await Transaction.deleteMany({ accountId });

    user.accounts.splice(accountIndex, 1);
    await user.save();

    res.status(200).json({ message: "Account deleted successfully", accounts: user.accounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("accounts");
    if (!user) return res.status(404).json({ message: "User not found" });

    const summary = user.accounts;

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
};
