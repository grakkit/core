import { file } from './file';

declare const Core: any;

export const root = file(Core.getRoot());

export function hook (script: Function) {
   Core.hook(script);
}

export function push (script: Function) {
   Core.push(script);
}

export function sync<X> (script: (...args: any[]) => Promise<X>): Promise<X> {
   return new Promise((resolve, reject) => {
      Core.sync(() => script().then(resolve).catch(reject));
   });
}
