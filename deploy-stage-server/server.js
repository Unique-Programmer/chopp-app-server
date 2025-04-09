const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3000;
const backendPath = '/home/vlad/app-backend/chopp-app-server';

// Basic Auth Setup
app.use(
  basicAuth({
    users: { admin: 'password' }, // Заменить в проде
    challenge: true,
  }),
);

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
    { name: 'backend', branch: req.body.backend_branch || 'main' },
    { name: 'client', branch: req.body.client_branch || 'master'},
    { name: 'admin', branch: req.body.admin_branch || 'main' },
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

app.post('/command', (req, res) => {
  const { cmd } = req.body;
  const logFile = path.join(__dirname, 'logs/deploy.log');

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] ${req.auth.user} ran command: ${cmd}\n`);

  let command;

  switch (cmd) {
    case 'down':
      command = ['docker-compose', 'down'];
      break;
    case 'down-volumes':
      command = ['docker-compose', 'down', '--volumes', '--rmi', 'all'];
      break;
    case 'remove-images':
      command = ['bash', '-c', 'docker rmi $(docker images -q)'];
      break;
    case 'staging-up':
      command = ['docker-compose', '-f', 'docker-compose.production.yml', 'up', '-d', '--build'];
      break;
    default:
      res.end('❌ Unknown command');
      return;
  }

  const proc = spawn(command[0], command.slice(1), { cwd: backendPath });

  proc.stdout.on('data', (data) => {
    res.write(data);
    fs.appendFileSync(logFile, data);
  });

  proc.stderr.on('data', (data) => {
    res.write(`ERR: ${data}`);
    fs.appendFileSync(logFile, `ERR: ${data}`);
  });

  proc.on('close', (code) => {
    res.write(`\n✅ Command ${cmd} finished with code ${code}`);
    res.end();
  });
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

app.get('/logs/memory', (req, res) => {
  const memoryLogs = spawn('bash', ['-c', 'watch -n 1 free -h']);
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

  memoryLogs.stdout.pipe(res);
  memoryLogs.stderr.pipe(res);

  req.on('close', () => {
    memoryLogs.kill();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Deploy panel running at http://localhost:${PORT}`);
});
