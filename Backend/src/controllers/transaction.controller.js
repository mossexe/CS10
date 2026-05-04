const TransactionService = require('../services/transaction.service');

class TransactionController {
  // ✅ TASK 4: Log to Redis Streams on transaction creation
  static async createTransaction(req, res, next) {
    try {
      const { user_id, item_id, quantity, description } = req.body;
      const redis = require('../database/redis');

      const transaction = await TransactionService.createTransaction({
        user_id,
        item_id,
        quantity,
        description,
      });

      // XADD to Redis Stream: transaction-logs
      const messageId = await redis.xadd(
        'transaction-logs',   // stream name
        '*',                  // auto-generate message ID
        'userId',    String(transaction.user_id),
        'itemId',    String(transaction.item_id),
        'total',     String(transaction.total)
      );
      console.log(`[Redis Stream] XADD transaction-logs — Message ID: ${messageId}`);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        payload: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);
      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        payload: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async payTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const result = await TransactionService.payTransaction(id, userId);
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        payload: {
          transaction_id: result.transactionId,
          new_balance: result.newBalance,
          status: 'paid',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(id);
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        payload: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;