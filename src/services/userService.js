const User = require('../models/User');

class UserService {
    
    async getAllUsers() {
        try {
            const users = await User.find({ isActive: true })
                .select('-password')
                .sort({ createdAt: -1 });
            return users;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            // Remover campos que no se pueden actualizar
            const { password, email, ...allowedUpdates } = updateData;
            
            const user = await User.findByIdAndUpdate(
                userId,
                allowedUpdates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async deactivateUser(userId) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { isActive: false },
                { new: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async searchUsers(query, page = 1, limit = 10) {
        try {
            const skip = helpers.getPaginationParams({ page, limit });
            
            const users = await User.find({
                $or: [
                    { firstName: { $regex: query, $options: 'i' } },
                    { lastName: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ],
                isActive: true
            })
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

            const total = await User.countDocuments({
                $or: [
                    { firstName: { $regex: query, $options: 'i' } },
                    { lastName: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ],
                isActive: true
            });

            return {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();