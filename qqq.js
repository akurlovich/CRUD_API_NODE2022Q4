'use strict';

class Queue {
  constructor(concurrency) {
    this.task = null;
    this.items = [];
    this.concurrency = concurrency;
    this.count = 0;
    this.waiting = [];
    this.onProcess = null;
    this.onDone = null;
    this.onSuccess = null;
    this.onFailure = null;
    this.onDrain = null;
  }

  static channels(concurrency) {
    return new Queue(concurrency);
  }

  add(task) {
    const hasChannel = this.count < this.concurrency;
    // console.log('hasChannel', hasChannel);
    if (hasChannel) {
      const found = this.items.find(e => e.targetId === task.targetId);
      if (found) {
        // console.log(task);
        this.waiting.push(task);
        return;
      }
      this.items.push(task);
      // console.log(this.items);
      this.next(task);
      return;
    }
    this.waiting.push(task);
    // console.log(this.waiting);
  }

  next(task) {
    if (this.task?.targetId === task.targetId) {
      console.log('1111111');
      this.task = task;
      this.waiting.push(task);
      return;
    } else {
      console.log('22222');
    }
    this.task = task;
    // console.log('NEXT');
    this.count++;
    this.onProcess(task, (err, result) => {
      // console.log('result', task);
      // if (err) {
      //   if (this.onFailure) this.onFailure(err);
      // } else if (this.onSuccess) {
      //   this.onSuccess(result);
      // }
      if (this.onDone) this.onDone(err, result);
      // this.count--;

      if (this.waiting.length > 0) {
        // console.log(this.waiting);
        const task = this.waiting.shift();
        // console.log(this.task);
        this.next(task);
        return;
      }


      // if (this.count === 0 && this.onDrain) {
      //   this.onDrain();
      // }
    });
  }

  process(listener) {
    this.onProcess = listener;
    return this;
  }

  done(listener) {
    this.onDone = listener;
    return this;
  }

  success(listener) {
    this.onSuccess = listener;
    return this;
  }

  failure(listener) {
    this.onFailure = listener;
    return this;
  }

  drain(listener) {
    this.onDrain = listener;
    return this;
  }
}

// Usage

const queueArray = [
  { targetId: 4, action: 'init' }, 
  { targetId: 0, action: 'init' }, 
  { targetId: 1, action: 'init' },
  { targetId: 6, action: 'init' }, 
  { targetId: 1, action: 'prepare' }, 
  { targetId: 8, action: 'init' },
  { targetId: 6, action: 'prepare' }, 
  { targetId: 2, action: 'init' }, 
  { targetId: 0, action: 'prepare' },
  { targetId: 5, action: 'init' }, 
  { targetId: 3, action: 'init' }, 
  { targetId: 7, action: 'init' },
  { targetId: 7, action: 'prepare' }, 
  { targetId: 3, action: 'prepare' }, 
  { targetId: 0, action: 'work' },
  { targetId: 8, action: 'prepare' }, 
  { targetId: 3, action: 'work' }, 
  { targetId: 4, action: 'prepare' },
  { targetId: 9, action: 'init' }, 
  { targetId: 2, action: 'prepare' },
  { targetId: 5, action: 'prepare' }, 
  { targetId: 0, action: 'finalize' }, 
  { targetId: 2, action: 'work' },
  // { targetId: 8, action: 'work' }, { targetId: 8, action: 'finalize' }, { targetId: 4, action: 'work' },
  // { targetId: 8, action: 'cleanup' }, { targetId: 9, action: 'prepare' }, { targetId: 0, action: 'cleanup' },
  // { targetId: 5, action: 'work' }, { targetId: 1, action: 'work' }, { targetId: 5, action: 'finalize' },
  // { targetId: 1, action: 'finalize' }, { targetId: 3, action: 'finalize' }, { targetId: 7, action: 'work' },
];

const job = (task, next) => {
  // console.log(`Process: ${task.name}`);
  setTimeout(() => {
    // console.log('object');
    next(null, task)
  }, 3000);
  // setTimeout(next, 2000, null, task);
};

const queue = Queue.channels(6)
  .process(job)
  // .done((err, res) => {
  //   const { count } = queue;
  //   const waiting = queue.waiting.length;
  //   console.log(`Done: ${res.name}, count:${count}, waiting: ${waiting}`);
  // })
  .done((err, task) => console.log(`Done: ${task.name}`))
  // .success((res) => console.log(`Success: ${res.name}`))
  // .failure((err) => console.log(`Failure: ${err}`))
  .drain(() => console.log('Queue drain'));

for (let i = 0; i < queueArray.length; i++) {
  // console.log(i);
  queue.add({ name: `Task target ID: ${queueArray[i].targetId}`,  targetId: queueArray[i].targetId});
}