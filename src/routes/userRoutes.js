const express = require('express');

const { 
    getUsers, 
    getUserById, 
    updateUser, 
    deactivateUser, 
    deleteUser 
} = require('../controllers/userController');
const { authenticate, requireVerifiedEmail } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);
router.use(requireVerifiedEmail);

router.get('/', getUsers);
router.get('/:id', validateObjectId, getUserById);
router.put('/:id', validateObjectId, updateUser);
router.patch('/:id/deactivate', validateObjectId, deactivateUser);
router.delete('/:id', validateObjectId, deleteUser);

module.exports = router;