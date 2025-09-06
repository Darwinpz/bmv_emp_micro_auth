const crypto = require('crypto');

class Helpers {
    // Generar token aleatorio
    generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Validar ObjectId de MongoDB
    isValidObjectId(id) {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    // Sanitizar entrada de usuario
    sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        return input;
    }

    // Paginación
    getPaginationParams(query, defaultLimit = 10, maxLimit = 100) {
        const page = Math.max(1, parseInt(query.page) || 1);
        let limit = Math.min(maxLimit, parseInt(query.limit) || defaultLimit);
        limit = Math.max(1, limit);
        
        const skip = (page - 1) * limit;
        
        return { page, limit, skip };
    }

}

module.exports = new Helpers();