import { Transaction } from "./transaction.model.js";

export const createTransaction = async (userId, data) => {
  return await Transaction.create({
    ...data,
    user: userId,
  });
};

export const getUserTransactions = async (userId) => {
  return await Transaction.find({ user: userId }).sort({ date: -1 });
};
export const getCategoryBreakdown = async (userId) => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
  
    return await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: currentMonthStart },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);
  };

  export const getLastSixMonthsTrend = async (userId) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
    return await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
  };