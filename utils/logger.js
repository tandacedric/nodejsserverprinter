/**
 * Configurations of logger.
 */
 const winston = require('winston');
 const winstonRotator = require('winston-daily-rotate-file');
 



  const DailyRotateFile = require('winston-daily-rotate-file');

  const successLogger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console(),
    ]
  });
  //
  // Replaces the previous transports with those in the
  // new configuration wholesale.
  //
  successLogger.configure({
    level: 'info',
    transports: [
      new DailyRotateFile({
        'name': 'access-file',
        'level': 'info',
        'filename': './logs/access-%DATE%.log',
        'json': false,
        'datePattern': 'YYYY-MM-DD',
        'prepend': true 
      })
    ]
  });

  const errorLogger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console(),
    ]
  });
  //
  // Replaces the previous transports with those in the
  // new configuration wholesale.
  //
  errorLogger.configure({
    level: 'error',
    transports: [
      new DailyRotateFile({
        'name': 'error-file',
        'level': 'error',
        'filename': './logs/error-%DATE%.log',
        'json': false,
        'datePattern': 'YYYY-MM-DD',
        'prepend': true
      })
    ]
  });

  module.exports = {
    'successlog': successLogger,
    'errorlog': errorLogger
  };