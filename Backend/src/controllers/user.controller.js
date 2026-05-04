const UserService = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await UserService.login(email, password);
      // Return only user data (no token) for /user/login
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ TASK 2: Cache-Aside Strategy — GET /user/:email
  static async getUserByEmail(req, res, next) {
    try {
      const { email } = req.params;
      const cacheKey = `user:${email}`;
      const redis = require('../database/redis');

      // 1. Check Redis cache first
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // CACHE HIT: return data directly from Redis
        console.log(`[Cache HIT] Key: ${cacheKey}`);
        return res.status(200).json({
          success: true,
          message: 'User retrieved successfully (from cache)',
          source: 'cache',
          payload: JSON.parse(cachedData),
        });
      }

      // CACHE MISS: query from PostgreSQL
      console.log(`[Cache MISS] Key: ${cacheKey} — querying PostgreSQL`);
      const user = await UserService.getUserByEmail(email);

      // Store in Redis with 60 seconds TTL
      await redis.set(cacheKey, JSON.stringify(user), 'EX', 60);
      console.log(`[Cache SET] Key: ${cacheKey} stored with EX=60`);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully (from database)',
        source: 'database',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ TASK 3: Cache Invalidation on Update — PUT /user/update
  static async updateProfile(req, res, next) {
    try {
      const { id, name, username, email, phone, password, balance } = req.body;
      const redis = require('../database/redis');

      const updatedUser = await UserService.updateProfile(id, { name, username, email, phone, password, balance });

      // Invalidate cache: delete the Redis key for this user's email
      if (updatedUser && updatedUser.email) {
        const cacheKey = `user:${updatedUser.email}`;
        await redis.del(cacheKey);
        console.log(`[Cache INVALIDATED] Key: ${cacheKey} deleted after update`);
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.user.userId;
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;