// server.js
const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Basic Auth Setup
app.use(basicAuth({
  users: { 'admin': 'password' }, // !!! Замени на нормальные
  challenge: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/deploy', (req, res) => {
  const { project, branch } = req.body;

  const logFile = path.join(__dirname, 'logs/deploy.log');
  const deploy = spawn('bash', ['./deploy.sh', project, branch]);

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.write(`🚀 Deploy started for ${project} on branch ${branch}\n\n`);

  fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] ${req.auth.user} started deploy: ${project} - ${branch}\n`);

  deploy.stdout.on('data', (data) => {
    res.write(data);
    fs.appendFileSync(logFile, data);
  });

  deploy.stderr.on('data', (data) => {
    res.write(`ERR: ${data}`);
    fs.appendFileSync(logFile, `ERR: ${data}`);
  });

  deploy.on('close', (code) => {
    res.write(`\n✅ Deploy process exited with code ${code}\n`);
    fs.appendFileSync(logFile, `Deploy finished with code ${code}\n`);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Deploy panel running at http://localhost:${PORT}`);
});
