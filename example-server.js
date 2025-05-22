const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const selfsigned = require('selfsigned');

const app = express();

const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : 5000;

app.get('/configuration', (_req, res) => {
  const filePath = path.join(__dirname, 'example-input', 'app-settings.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading configuration file');
    } else {
      res.type('application/json').send(data);
    }
  });
});

app.get('/configuration-invalid', (_req, res) => {
  const filePath = path.join(__dirname, 'example-input', 'app-settings-invalid.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading configuration file');
    } else {
      res.type('application/json').send(data);
    }
  });
});

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 1 });

https.createServer({ key: pems.private, cert: pems.cert }, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});