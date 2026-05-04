const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');

class UserService {
  static async register({ name, username, email, phone, password }) {
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return user;
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
      },
    };
  }

  // ✅ TASK 2: Get user by email (used by cache-aside controller)
  static async getUserByEmail(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    // Return safe fields only (no password)
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      balance: user.balance,
      created_at: user.created_at,
    };
  }

  static async updateProfile(id, updateData) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  static async getTransactionHistory(userId) {
    return await User.getTransactionHistory(userId);
  }

  static async getTotalSpent(userId) {
    return await User.getTotalSpent(userId);
  }
}

module.exports = UserService;