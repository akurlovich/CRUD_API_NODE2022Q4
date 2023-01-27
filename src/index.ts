import { createServer } from 'http';
import config from './Common/config';
import { ERROR_IN_SERVER_SIDE, WRONG_ROUT } from './Common/constants';
import { UserController } from './Controllers/userController';
import { findMatch, getID } from './Utils/UserHelpFunctions';

// const { getUsers, getUser, createUser, updateUser, removeUser } = UserController;

// export const server = createServer(async (req, res) => {
//   req.on('error', () => {
//     res.writeHead(500, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ message: ERROR_IN_SERVER_SIDE }));
//   });
//   res.on('error', () => {
//     res.writeHead(500, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ message: ERROR_IN_SERVER_SIDE }));
//   });

//   const API_ENDPOINT = '/api/users';
//   const URL = req.url || '';
//   const regex = /\/api\/users\/\w+/;
//   const id = getID(URL);

//   if (URL === API_ENDPOINT && req.method === 'GET') {
//     await getUsers(res);
//   }
//   else if (URL === API_ENDPOINT && req.method === 'POST') {
//     await createUser(req, res);
//   } 
//   else if (findMatch(URL, regex) && req.method === 'GET') {
//     await getUser(res, id);
//   }
//   else if (findMatch(URL, regex) && req.method === 'PUT') {
//     await updateUser(req, res, id);
//   } 
//   else if (findMatch(URL, regex) && req.method === 'DELETE') {
//     await removeUser(res, id);
//   } 
//   else {
//     res.writeHead(404, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ message: WRONG_ROUT }));
//   }
  
// });

// server.listen(config.PORT, () => {
//   console.log(`Server started on port: ${config.PORT}`);
// });

type ActionType = 'init' | 'prepare' | 'work' | 'finalize' | 'cleanup';

interface ITask {
    targetId: number
    action: ActionType
}

interface ITaskWaiting {
  task: ITask
  start: number
  priority: number
}

const queueArray: ITask[] = [
  { targetId: 4, action: 'init' }, { targetId: 0, action: 'init' }, { targetId: 1, action: 'init' },
  { targetId: 6, action: 'init' }, { targetId: 1, action: 'prepare' }, { targetId: 8, action: 'init' },
  { targetId: 6, action: 'prepare' }, { targetId: 2, action: 'init' }, { targetId: 0, action: 'prepare' },
  { targetId: 5, action: 'init' }, { targetId: 3, action: 'init' }, { targetId: 7, action: 'init' },
  { targetId: 7, action: 'prepare' }, { targetId: 3, action: 'prepare' }, { targetId: 0, action: 'work' },
  { targetId: 8, action: 'prepare' }, { targetId: 3, action: 'work' }, { targetId: 4, action: 'prepare' },
  { targetId: 9, action: 'init' }, { targetId: 2, action: 'prepare' },
  { targetId: 5, action: 'prepare' }, { targetId: 0, action: 'finalize' }, { targetId: 2, action: 'work' },
  { targetId: 8, action: 'work' }, { targetId: 8, action: 'finalize' }, { targetId: 4, action: 'work' },
  { targetId: 8, action: 'cleanup' }, { targetId: 9, action: 'prepare' }, { targetId: 0, action: 'cleanup' },
  { targetId: 5, action: 'work' }, { targetId: 1, action: 'work' }, { targetId: 5, action: 'finalize' },
  { targetId: 1, action: 'finalize' }, { targetId: 3, action: 'finalize' }, { targetId: 7, action: 'work' },
];

class Queue {
  paused: boolean;
  concurrency: number;
  count: number;
  waiting: ITaskWaiting[];
  onProcess: (task: ITask, finish: (err: Error, res: ITask) => void) => void;
  onDone: (err: Error, res: ITask) => void;
  onSuccess: (res: ITask) => void = null;
  onFailure: (err: Error, res: ITask) => void;
  onDrain: () => void = null;
  waitTimeout = Infinity;
  processTimeout = Infinity;
  priorityMode = false;
  destination: { (): void; add?: any; } = null;

  constructor(concurrency: number) {
    this.paused = false;
    this.concurrency = concurrency;
    this.count = 0;
    this.waiting = [];
    this.onProcess = null;
    this.onDone = null;
    this.onSuccess = null;
    this.onFailure = null;
    this.onDrain = null;
    this.waitTimeout = Infinity;
    this.processTimeout = Infinity;
    this.priorityMode = false;
    this.destination = null;
  }

  static channels(concurrency: number) {
    return new Queue(concurrency);
  }

  wait(msec: number) {
    this.waitTimeout = msec;
    return this;
  }

  timeout(msec: number) {
    this.processTimeout = msec;
    return this;
  }

  add(task: ITask, priority = 0) {
    if (!this.paused) {
      const hasChannel = this.count < this.concurrency;
      if (hasChannel) {
        this.next(task);
        return;
      }
    }
    this.waiting.push({ task, start: Date.now(), priority });
    if (this.priorityMode) {
      this.waiting.sort((a, b) => b.priority - a.priority);
    }
  }

  next(task: ITask) {
    this.count++;
    let timer: ReturnType<typeof setTimeout> = null;
    let finished = false;
    const { processTimeout, onProcess } = this;
    const finish = (err: Error, res: ITask) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      this.count--;
      this.finish(err, res);
      if (!this.paused && this.waiting.length > 0) this.takeNext();
    };
    if (processTimeout !== Infinity) {
      const err = new Error('Process timed out');
      timer = setTimeout(finish, processTimeout, err, task);
    }
    onProcess(task, finish);
  }

  takeNext() {
    const { waiting, waitTimeout } = this;
    const { task, start } = waiting.shift();
    if (waitTimeout !== Infinity) {
      const delay = Date.now() - start;
      if (delay > waitTimeout) {
        const err = new Error('Waiting timed out');
        this.finish(err, task);
        if (waiting.length > 0) {
          setTimeout(() => {
            if (!this.paused && waiting.length > 0) this.takeNext();
          }, 0);
        }
        return;
      }
    }
    const hasChannel = this.count < this.concurrency;
    if (hasChannel) this.next(task);
    return;
  }

  finish(err: Error, res: ITask) {
    const { onFailure, onSuccess, onDone, onDrain } = this;
    if (err) {
      if (onFailure) onFailure(err, res);
    } else {
      if (onSuccess) onSuccess(res);
      if (this.destination) this.destination.add(res);
    }
    if (onDone) onDone(err, res);
    if (this.count === 0 && onDrain) onDrain();
  }

  process(listener: (task: ITask, next: (err: Error, res: ITask) => void) => void) {
    this.onProcess = listener;
    return this;
  }

  done(listener: (err: Error, res: ITask) => void) {
    this.onDone = listener;
    return this;
  }

  success(listener: (res: ITask) => void) {
    this.onSuccess = listener;
    return this;
  }

  failure(listener: (err: Error, res: ITask) => void) {
    this.onFailure = listener;
    return this;
  }

  drain(listener: () => void) {
    this.onDrain = listener;
    return this;
  }

  pause() {
    this.paused = true;
    return this;
  }

  resume() {
    if (this.waiting.length > 0) {
      const channels = this.concurrency - this.count;
      for (let i = 0; i < channels; i++) {
        this.takeNext();
      }
    }
    this.paused = false;
    return this;
  }

  priority(flag = true) {
    this.priorityMode = flag;
    return this;
  }

  pipe(destination: () => void) {
    this.destination = destination;
    return this;
  }
}
  
  // Usage

const job = (task: ITask, next: (err: Error, res: ITask) => void) => {
  console.log(`Process targetId: ${task.targetId}`);
  // next(null, task)
  setTimeout(next, 0, null, task);
};

const queueArr = Queue.channels(3)
  .process(job)
  .done((err: Error, res: ITask) => {
    const { count } = queueArr;
    const waiting = queueArr.waiting.length;
    console.log(`Done targetId: ${res.targetId}, count:${count}, waiting: ${waiting}`);
  })
  .success((res: ITask) => console.log(`Success targetId: ${res.targetId}`))
  // .failure((res: ITask) => console.log(`Failure targetId: ${err}`))
  .failure((err: Error, res: ITask) => console.log(`Failure: ${err}`))
  .drain(() => console.log('Queue drain'));

for (let i = 0; i < queueArray.length; i++) {
  // queue.add({ name: `Task${i}`, interval: i * 1000 });
  queueArr.add(queueArray[i]);
}
  
  // const destination = Queue.channels(2)
  //   .wait(5000)
  //   .process((task: any, next: (arg0: any, arg1: any) => any) => next(null, { ...task, processed: true }))
  //   .done((err: any, task: any) => console.log({ task }));
  
  // const source = Queue.channels(3)
  //   .timeout(4000)
  //   .process((task: { interval: number; }, next: (args_0: any, args_1: any) => void) => setTimeout(next, task.interval, null, task))
  //   .pipe(destination);
  
  // for (let i = 0; i < 10; i++) {
  //   source.add({ name: `Task${i}`, interval: 1000 });
  // }

