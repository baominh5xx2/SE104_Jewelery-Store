const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
class UserService {
    static generateToken(userData) {
        return jwt.sign(userData, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }

    static generateRefreshToken(userData) {
        return jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        });
    }

    static async createUser(username, password, role) {
        const existingUser = await User.findOne({ where: { TenTaiKhoan: username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const validRoles = ['admin', 'seller', 'warehouse'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({
            TenTaiKhoan: username,
            MatKhau: hashedPassword,
            Role: role
        });
    }

    static async login(username, password) {
        const user = await User.findOne({ where: { TenTaiKhoan: username } });
        
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.MatKhau);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        const userData = {
            userId: user.MaTaiKhoan,
            username: user.TenTaiKhoan,
            role: user.Role
        };

        return {
            userId: user.MaTaiKhoan,
            username: user.TenTaiKhoan,
            role: user.Role,
            accessToken: UserService.generateToken(userData),
            refreshToken: UserService.generateRefreshToken(userData)
        };
    }

    static async findById(id) {
        return await User.findByPk(id);
    }

    static async getAllUsers() {
        try {
            return await User.findAll({
                attributes: ['MaTaiKhoan', 'TenTaiKhoan', 'Role']
            });
        } catch (error) {
            throw new Error('Error getting users: ' + error.message);
        }
    }

    static async addUser(userData) {
        try {
            const { username, password, role } = userData;

            // Validate required fields
            if (!username || !password || !role) {
                throw new Error('Username, password and role are required');
            }

            // Check if user exists
            const existingUser = await User.findOne({ 
                where: { TenTaiKhoan: username } 
            });
            
            if (existingUser) {
                throw new Error('Username already exists');
            }

            // Validate role
            const validRoles = ['admin', 'seller', 'warehouse'];
            if (!validRoles.includes(role)) {
                throw new Error('Invalid role');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            return await User.create({
                TenTaiKhoan: username,
                MatKhau: hashedPassword,
                Role: role
            });
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async updateUser(userId, updateData) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const updates = {};
            
            // Update username (TenTaiKhoan)
            if (updateData.TenTaiKhoan) {
                // Check if new username is taken
                const existingUser = await User.findOne({
                    where: { 
                        TenTaiKhoan: updateData.TenTaiKhoan,
                        MaTaiKhoan: { [Op.ne]: userId }
                    }
                });
                if (existingUser) {
                    throw new Error('Username already taken');
                }
                updates.TenTaiKhoan = updateData.TenTaiKhoan;
            }

            // Update role
            if (updateData.Role) {
                const validRoles = ['admin', 'seller', 'warehouse'];
                if (!validRoles.includes(updateData.Role)) {
                    throw new Error('Invalid role');
                }
                updates.Role = updateData.Role;
            }

            // Perform update
            await user.update(updates);
            
            // Return updated user without password
            return await User.findByPk(userId, {
                attributes: ['MaTaiKhoan', 'TenTaiKhoan', 'Role']
            });

        } catch (error) {
            throw new Error('Error updating user: ' + error.message);
        }
    }

    static async deleteUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            await user.destroy();
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error('Error deleting user: ' + error.message);
        }
    }
}

module.exports = UserService;