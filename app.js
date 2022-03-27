const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');

const index = fs.readFileSync('./index.html', 'utf-8');
const app = express();

let privateKey; 
let certificate;
let credentials;
if  (fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem')) {
  privateKey  = fs.readFileSync('./certs/key.pem', 'utf-8');
  certificate = fs.readFileSync('./certs/cert.pem', 'utf-8');
  credentials = {key: privateKey, cert: certificate};
}


app.use('/assets', express.static('assets'));

app.get(['/', '/index.html'], (req, res) => {
    res.send(index);
});

app.get('*', (req, res) => {
  res.redirect('/');
});

var httpServer = http.createServer(app);
let httpsServer;
if (credentials) {
  httpsServer = https.createServer(credentials, app);
}

httpServer.listen(80);
if (httpsServer) {
  httpsServer.listen(443);
}
else console.log('HTTPS server not running...')