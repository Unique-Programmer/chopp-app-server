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
  users: { 'admin': 'password' }, // Заменить в проде
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
  const repos = [
    { name: 'backend', branch: req.body.backend_branch },
    { name: 'client', branch: req.body.client_branch },
    { name: 'admin', branch: req.body.admin_branch }
  ];

  const logFile = path.join(__dirname, 'logs/deploy.log');

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.write(`🚀 Starting deploy...\n\n`);

  const deployNext = (index) => {
    if (index >= repos.length) {
      res.write('\n✅ All deployments finished.');
      res.end();
      return;
    }

    const { name, branch } = repos[index];
    res.write(`\n🔧 Deploying ${name}:${branch}\n`);
    fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] ${req.auth.user} -> ${name}:${branch}\n`);

    const deploy = spawn('bash', ['./deploy.sh', name, branch]);

    deploy.stdout.on('data', (data) => {
      res.write(data);
      fs.appendFileSync(logFile, data);
    });

    deploy.stderr.on('data', (data) => {
      res.write(`ERR: ${data}`);
      fs.appendFileSync(logFile, `ERR: ${data}`);
    });

    deploy.on('close', (code) => {
      res.write(`\n⚙️ Finished ${name} with code ${code}\n`);
      deployNext(index + 1);
    });
  };

  deployNext(0);
});

app.get('/logs/main', (req, res) => {
  const dockerLogs = spawn('docker', ['logs', '-f', 'main']);
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

  dockerLogs.stdout.pipe(res);
  dockerLogs.stderr.pipe(res);

  req.on('close', () => {
    dockerLogs.kill();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Deploy panel running at http://localhost:${PORT}`);
});