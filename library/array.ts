import { type } from './type';

const Iterable = type('java.lang.Iterable');
const Iterator = type('java.util.Iterator');
const Spliterator = type('java.util.Spliterator');

export function array (object: any): any[] {
   if (object instanceof Array) {
      return [ ...object ];
   } else if (object instanceof Iterable) {
      const output = [];
      object.forEach((value: any) => {
         output.push(value);
      });
      return output;
   } else if (object instanceof Iterator || object instanceof Spliterator) {
      const output = [];
      object.forEachRemaining((value: any) => {
         output.push(value);
      });
      return output;
   } else {
      return null;
   }
}
