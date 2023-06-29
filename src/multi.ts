import cluster, { Worker } from 'cluster';
import { cpus } from 'os';
import { pid } from 'process';

void (async () => {
  if (cluster.isPrimary) {
    const cpusCount = cpus().length;

    console.log(`Master pid: ${pid}`);
    console.log(`Starting ${cpusCount} forks`);
    const workers: Worker[] = [];

    for (let i = 0; i < cpusCount; i++) {
      const worker = cluster.fork();
      workers.push(worker);

      worker.on('message', ({ pid, users }) => {
        workers.forEach((item) => {
          !item.isDead() && item.process.pid !== pid && item.send(users);
        })
      })
    }
  } else {
    const id = cluster.worker?.id;
    await import('./index');
    console.log(`Worker: ${id}, pid: ${pid}`);
  }
})();