const UserService = require('../services/userService');

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const result = await UserService.createUser(username, password, role);
        return res.status(201).json({ 
            message: "User created successfully", 
            user: result
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userData = await UserService.login(username, password);
        return res.status(200).json({ 
            message: "Login success",
            ...userData
        });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const userData = await UserService.addUser(req.body);
        return res.status(201).json({
            message: "User added successfully",
            user: userData
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const   getUserById = async (req, res) => {
    try {
        const user = await UserService.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await UserService.deleteUser(req.params.id);
        return res.status(200).json({ 
            message: "User deleted successfully" 
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createUser,
    handleLogin,
    addUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};