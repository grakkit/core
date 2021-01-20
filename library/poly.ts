import { task, cancel, interval, timeout } from './task';

const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const promise = Promise.resolve();
const storage: { index: number; list: Map<number, task> } = { index: 0, list: new Map() };

export function atob (data: string) {
   let index = 0;
   let result = '';
   while (index < data.length) {
      let a = base.indexOf(data.charAt(index++));
      let b = base.indexOf(data.charAt(index++));
      let c = ((a & 0xf) << 4) | ((b >> 2) & 0xf);
      let d = ((b & 0x3) << 6) | (base.indexOf(data.charAt(index++)) & 0x3f);
      result += String.fromCharCode(((base.indexOf(data.charAt(index++)) & 0x3f) << 2) | ((a >> 4) & 0x3));
      result += c ? String.fromCharCode(c) : '';
      result += d ? String.fromCharCode(d) : '';
   }
   return result;
}

export function btoa (data: string) {
   let index = 0;
   let result = '';
   while (index < data.length) {
      let a = data.charCodeAt(index++) || 0;
      let b = data.charCodeAt(index++) || 0;
      let c = data.charCodeAt(index++) || 0;
      let d = ((b & 0xf) << 2) | ((c >> 6) & 0x3);
      let e = c & 0x3f;
      b ? c || (e = 64) : (d = e = 64);
      result += base.charAt((a >> 2) & 0x3f);
      result += base.charAt(((a & 0x3) << 4) | ((b >> 4) & 0xf));
      result += base.charAt(d);
      result += base.charAt(e);
   }
   return result;
}

export function clearInterval (handle?: number) {
   cancel(storage.list.get(handle));
}

export function clearTimeout (handle?: number) {
   cancel(storage.list.get(handle));
}

export function queueMicrotask (callback: () => void) {
   promise.then(callback).catch((error) => {
      timeout(() => {
         throw error;
      });
   });
}

export function setInterval (script: string | Function, period = 0, ...args: any[]) {
   storage.list.set(
      storage.index,
      interval(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args)
   );
   return storage.index++;
}

export function setTimeout (script: string | Function, period = 0, ...args: any[]) {
   storage.list.set(
      storage.index,
      timeout(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args)
   );
   return storage.index++;
}
