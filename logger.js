const winston = require('winston');

const myFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    if (typeof message === 'object') {
        message = JSON.stringify(message, null, 4)
    }
    if(stack) return `${timestamp} ${level}: ${message} ${stack}`;
    return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.errors({stack: true}),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple(), myFormat) })
    ]
});

/*if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple(), myFormat)
    }));
}*/

module.exports = {
    logger
} 