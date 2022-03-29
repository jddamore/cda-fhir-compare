const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');

const index = fs.readFileSync('./index.html', 'utf-8');
const example = fs.readFileSync('./example.html', 'utf-8');
const output = fs.readFileSync('./output.html', 'utf-8');
const app = express();

const highlight = require('./highlight');

// Check on security/certificate stuff
let privateKey; 
let certificate;
let credentials;
if  (fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem')) {
  privateKey  = fs.readFileSync('./certs/key.pem', 'utf-8');
  certificate = fs.readFileSync('./certs/cert.pem', 'utf-8');
  credentials = {key: privateKey, cert: certificate};
}

// Express app setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/assets', express.static('assets'));
app.use('/examples', express.static('examples'));
app.use('/colors.css', express.static('colors.css'));

app.get(['/', '/index.html'], (req, res) => {
    res.send(index);
});

app.get(['/example'], (req, res) => {
  res.send(example);
});

app.get(['/output'], (req, res) => {
  res.send(output);
});

app.post('/data', (req, res) => {
  res.send(highlight(req.body.cda, req.body.fhir));
})

/*
app.get('*', (req, res) => {
  res.redirect('/');
});
*/

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