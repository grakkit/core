import { chain } from './chain';
import { push } from './core';

declare const console: any;

export type task = { tick: number; args: any[]; script: Function };

const storage: { list: Set<task>; tick: number } = { list: new Set(), tick: 0 };

export function cancel (handle: task) {
   storage.list.delete(handle);
}

export function interval (script: Function, period = 0, ...args: any[]) {
   const task = timeout(
      (...args: any[]) => {
         task.tick += Math.ceil(period < 1 ? 1 : period);
         script(...args);
      },
      0,
      ...args
   );
   return task;
}

export function timeout (script: Function, period = 0, ...args: any[]) {
   const task = { tick: storage.tick + Math.ceil(period < 0 ? 0 : period), args, script };
   storage.list.add(task);
   return task;
}

chain(void 0, (none, next) => {
   push(next);
   for (const task of storage.list) {
      if (storage.tick > task.tick) {
         storage.list.delete(task);
      } else if (storage.tick === task.tick) {
         try {
            task.script(...task.args);
         } catch (error) {
            console.error('An error occured while attempting to execute a task!');
            console.error(error.stack || error.message || error);
         }
      }
   }
   ++storage.tick;
});
