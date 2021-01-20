import { file } from './file';
import { type } from './type';
import { simplify } from './simplify';
import { root, hook } from './core';

const Paths = type('java.nio.file.Paths');

const storage: Map<string, any> = new Map();

export function data (path: string, ...more: string[]) {
   const name = Paths.get(path, ...more).normalize().toString();
   storage.has(name) || storage.set(name, file(root, 'data', `${name}.json`).json() || {});
   return storage.get(name);
}

hook(() => {
   for (const [ name ] of storage) {
      file(root, 'data', `${name}.json`).entry().write(JSON.stringify(simplify(storage.get(name))));
   }
});
