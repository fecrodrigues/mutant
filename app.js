const restify = require('restify');
const cluster = require('cluster');
const consign = require('consign');

const cpus = require('os').cpus();


if(cluster.isMaster) {
  cpus.forEach(() => cluster.fork());
  cluster.on('listening', (worker) => {
    console.log(`Cluster ${worker.process.pid} conectado`);
  });
  cluster.on('disconnect', (worker) => {
    console.log(`Cluster ${worker.process.pid} desconectado`);
  });
  cluster.on('exit', (worker) => {
    console.log(`Cluster ${worker.process.pid} finalizado`);
  });
} else {
  const app = restify.createServer({
      name: 'teste-mercado-livre',
      version: '1.0.0'
  });

  app.use(restify.plugins.acceptParser(app.acceptable));
  app.use(restify.plugins.queryParser());
  app.use(restify.plugins.bodyParser());

  consign({verbose: false})
    .include('mongodb.config.js')
    .then('models')
    .then('components')
    .then('routes')
    .into(app);

  app.listen(8080, function () {
    console.log('%s Iniciado na porta %s', app.name, app.url);
  });
}
