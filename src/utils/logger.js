const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'bmv_emp_micro_auth' },
    transports: [
        // Escribir todos los logs con nivel `error` y menor a `error.log`
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        // Escribir todos los logs con nivel `info` y menor a `combined.log`
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        }),
        // También escribir logs a la consola en desarrollo
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Si estamos en producción, también enviar logs a un servicio externo
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.Http({
        level: 'warn',
        format: winston.format.json()
    }));
}

// Stream para morgan (logging de HTTP)
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;