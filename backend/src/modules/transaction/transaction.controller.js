import {
    createTransaction,
    getUserTransactions,
    getCategoryBreakdown,
  } from "./transaction.service.js";
  
  export const addTransaction = async (req, res) => {
    try {
      const transaction = await createTransaction(
        req.user._id,
        req.body
      );
  
      res.status(201).json({
        message: "Transaction added",
        transaction,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const getTransactions = async (req, res) => {
    try {
      const transactions = await getUserTransactions(req.user._id);
  
      res.status(200).json({
        transactions,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  export const categoryBreakdown = async (req, res) => {
    try {
      const data = await getCategoryBreakdown(req.user._id);
      res.status(200).json({ categories: data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  import { getLastSixMonthsTrend } from "./transaction.service.js";

  export const lastSixMonthsTrend = async (req, res) => {
    try {
      const data = await getLastSixMonthsTrend(req.user._id);
      res.status(200).json({ trend: data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  