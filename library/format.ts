import { type } from './type';
import { array } from './array';
import { simplify } from './simplify';

const Class = type('java.lang.Class');

const circular = Symbol();

export function error (error: any) {
   let type = 'Error';
   let message = `${error}`;
   if (error.stack) {
      type = error.stack.split('\n')[0].split(' ')[0].slice(0, -1);
      message = error.message;
      switch (type) {
         case 'TypeError':
            try {
               if (message.startsWith('invokeMember') || message.startsWith('execute on foreign object')) {
                  const reason = message.split('failed due to: ')[1];
                  if (reason.startsWith('no applicable overload found')) {
                     const sets = reason.split('overloads:')[1].split(']],')[0].split(')]').map((set) => {
                        return `(${set.split('(').slice(1).join('(')})`;
                     });
                     message = [ 'Invalid arguments! Expected:\u00a74', ...sets ].join('\n -> ').slice(0, -1);
                  } else if (reason.startsWith('Arity error')) {
                     message = `Invalid argument amount! Expected: ${reason.split('-')[1].split(' ')[2]}`;
                  } else if (reason.startsWith('UnsupportedTypeException')) {
                     message = 'Invalid arguments! Expected: \u00a74N/A';
                  } else if (reason.startsWith('Unknown identifier')) {
                     message = `That method (${reason.split(': ')[1]}) is not a member of its parent!`;
                  } else if (reason.startsWith('Message not supported')) {
                     message = `That method (${message.slice(14).split(')')[0]}) is not a member of its parent!`;
                  } else {
                     message = message.split('\n')[0];
                  }
               }
            } catch (error) {
               message = message.split('\n')[0];
            }
            break;
         case 'SyntaxError':
            message = message.split(' ').slice(1).join(' ').split('\n')[0];
      }
   } else {
      error = `${error}`;
      type = error.split(' ')[0].slice(0, -1);
      message = error.split(' ').slice(1).join(' ');
   }
   return `${type}: ${message}`;
}

export function output (object: any, condense?: boolean): string {
   if (condense === true) {
      if (object === circular) {
         return '...';
      } else {
         const type = toString.call(object);
         switch (type) {
            case '[object Array]':
            case '[object Object]':
            case '[object Function]':
               return type.split(' ')[1].slice(0, -1);
            case '[foreign HostObject]':
               if (object instanceof Class) {
                  return object.getCanonicalName();
               } else if (typeof object.toString === 'function') {
                  const string = object.toString();
                  if (string) {
                     return string;
                  }
               }
               const clazz = typeof object.getClass === 'function' ? object.getClass() : object.class;
               if (clazz instanceof Class) {
                  return clazz.getCanonicalName();
               } else {
                  return `${object}` || 'Object';
               }
            case '[foreign HostFunction]':
               return 'Function';
            default:
               switch (typeof object) {
                  case 'bigint':
                     return object.toString() + 'n';
                  case 'function':
                     return 'Function';
                  case 'object':
                     return object ? 'Object' : 'null';
                  case 'symbol':
                     return `<${object.toString().slice(7, -1)}>`;
                  case 'undefined':
                     return 'undefined';
                  default:
                     return JSON.stringify(object);
               }
         }
      }
   } else {
      switch (toString.call(object)) {
         case '[object Array]':
            return `[ ${[ ...object ]
               .map((value: any) => output(object === value ? circular : value, true))
               .join(', ')} ]`;
         case '[object Object]':
            return `{ ${[
               ...Object.getOwnPropertyNames(object).map((key) => {
                  return `${key}: ${output(object === object[key] ? circular : object[key], true)}`;
               }),
               ...Object.getOwnPropertySymbols(object).map((key) => {
                  return `${output(key, true)}: ${output(object === object[key] ? circular : object[key], true)}`;
               })
            ].join(', ')} }`;
         case '[object Function]':
            return object.toString().replace(/\r/g, '');
         case '[foreign HostFunction]':
            return 'function () { [native code] }';
         default:
            const list = array(object);
            if (list) {
               return output(list);
            } else {
               return output(object, true);
            }
      }
   }
}
