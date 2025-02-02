const express = require('express');
const router = express.Router();
const { 
    createUser, 
    handleLogin, 
    getAllUsers, 
    getUserById,
    updateUser,
    deleteUser,
    addUser
} = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

// Public routes
router.post("/register", createUser);
router.post("/login", handleLogin);

// Protected routes requiring authentication
router.post("/add", verifyToken, addUser);
router.get("/get-all", verifyToken, getAllUsers);
router.get("/get-details/:id", verifyToken, getUserById);
router.put("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);

module.exports = router;