import { types } from './overloads';

const storage: Map<keyof types, any> = new Map();

export function type<X extends keyof types> (name: X): types[X] {
   storage.has(name) || storage.set(name, Java.type(name));
   return storage.get(name);
}
