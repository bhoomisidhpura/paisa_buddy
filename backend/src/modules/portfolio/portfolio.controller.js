import {
    getPortfolioData,
    getAvailableStocks,
    buyStock,
    sellStock,
  } from "./portfolio.service.js";
  
  // GET /api/portfolio
  export const getPortfolio = async (req, res) => {
    try {
      const data = await getPortfolioData(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // GET /api/portfolio/stocks
  export const getStocks = async (req, res) => {
    try {
      const stocks = getAvailableStocks();
      res.status(200).json({ success: true, data: stocks });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // POST /api/portfolio/buy
  // Body: { symbol: "TCS", quantity: 2 }
  export const buy = async (req, res) => {
    try {
      const { symbol, quantity } = req.body;
      if (!symbol || !quantity) {
        return res.status(400).json({ message: "symbol and quantity are required" });
      }
      const result = await buyStock(req.user._id, symbol, parseInt(quantity));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // POST /api/portfolio/sell
  // Body: { symbol: "TCS", quantity: 1 }
  export const sell = async (req, res) => {
    try {
      const { symbol, quantity } = req.body;
      if (!symbol || !quantity) {
        return res.status(400).json({ message: "symbol and quantity are required" });
      }
      const result = await sellStock(req.user._id, symbol, parseInt(quantity));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };