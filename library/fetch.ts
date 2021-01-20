import { sync } from './core';
import { type } from './type';
import { jiInputStream, jnHttpURLConnection } from '@grakkit/core-classes';

export type response = {
   net: jnHttpURLConnection;
   json(async?: false): any;
   json(async: true): Promise<any>;
   read(async?: false): string;
   read(async: true): Promise<string>;
   stream(async?: false): jiInputStream;
   stream(async: true): Promise<jiInputStream>;
};

const Scanner = type('java.util.Scanner');
const URL = type('java.net.URL');

export function fetch (link: string) {
   //@ts-expect-error
   const net: jnHttpURLConnection = new URL(link).openConnection();
   net.setDoOutput(true);
   net.setRequestMethod('GET');
   net.setInstanceFollowRedirects(true);
   const thing: response = {
      net,
      json (async?: boolean) {
         if (async) {
            return sync(async () => thing.json());
         } else {
            try {
               return JSON.parse(thing.read());
            } catch (error) {
               throw error;
            }
         }
      },
      //@ts-expect-error
      read (async?: boolean) {
         if (async) {
            return sync(async () => thing.read());
         } else {
            return new Scanner(thing.stream()).useDelimiter('\\A').next();
         }
      },
      //@ts-expect-error
      stream (async?: boolean) {
         if (async) {
            return sync(async () => thing.stream());
         } else {
            const code = net.getResponseCode();
            switch (code) {
               case 200:
                  return net.getInputStream();
               default:
                  throw new ReferenceError(`${code} ${net.getResponseMessage()}`);
            }
         }
      }
   };
   return thing;
}
