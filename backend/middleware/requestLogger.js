const store = require('../data/store');
const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../data/requests.csv');

// Initialize CSV with headers if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Timestamp,Method,URL,IP,StatusCode\n', 'utf8');
}

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.socket.remoteAddress || '::1';

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const consoleLog = `[${timestamp}] ${method} ${url} ${ip} - HTTP ${statusCode}`;
    console.log(consoleLog);

    store.requestLogs.push({
      id: Date.now() + Math.random(),
      timestamp,
      method,
      url,
      ip,
      statusCode
    });

    if (store.requestLogs.length > 100) store.requestLogs.shift();

    // Append to CSV
    const csvLine = `"${timestamp}","${method}","${url}","${ip}","${statusCode}"\n`;
    fs.appendFile(csvFilePath, csvLine, (err) => {
      if (err) console.error('Failed to write to requests.csv:', err);
    });
  });

  next();
};

module.exports = requestLogger;
