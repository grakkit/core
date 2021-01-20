import { type } from './type';
import { chain } from './chain';
import { jiFile } from '@grakkit/core-classes';

declare const Core: any;

/** A utility for paths and files. */
export type record = {
   /** Returns an array of modifiers for the contents of the folder (if any) at the current path. */
   readonly children: record[];
   /** Creates a folder at the current path if no file or folder already exists there. */
   directory(): record;
   /** Creates a file at the current path if no file or folder already exists there. */
   entry(): record;
   /** Whether a file or folder exists at the current path or not. */
   readonly exists: boolean;
   /** Joins the current path and the given sub-path, and returns a new modifier for it. */
   file(...sub: string[]): record;
   /** Starting from the current path, removes parent folders upstream until a parent folder is non-empty. */
   flush(): record;
   /** The java file for the current path. */
   io: jiFile;
   /** Synchronously parses the JSON content of the file (if any) at the current path. */
   json(async?: false): any;
   /** Parses the JSON content of the file (if any) at the current path. */
   json(async: true): Promise<any>;
   /** The name of the current path. */
   readonly name: string;
   /** The current path. */
   readonly path: string;
   /** The record for the parent folder of the current path. */
   readonly parent: record;
   /** Synchronously returns the content of the file (if any) at the current path. */
   read(async?: false): string;
   /** Returns the content of the file (if any) at the current path. */
   read(async: true): Promise<string>;
   /** Removes and flushes the file or folder (if any) at the current path. */
   remove(): record;
   /** Whether the current path represents a folder, a file, or none of the above. */
   readonly type: 'folder' | 'file' | 'none';
   /** Synchronously writes the given content to the file (if any) at the current path. */
   write(content: string, async?: false): record;
   /** Writes the given content to the file (if any) at the current path. */
   write(content: string, async: true): Promise<record>;
};

const Files = type('java.nio.file.Files');
const JavaString = type('java.lang.String');
const Paths = type('java.nio.file.Paths');

/** A utility wrapper for paths and files. */
export function file (path: string | record | jiFile, ...more: string[]) {
   path = typeof path === 'string' ? path : 'io' in path ? path.path : path.getPath();
   const io = Paths.get(path, ...more).normalize().toFile();
   const thing: record = {
      get children () {
         return thing.type === 'folder' ? [ ...io.listFiles() ].map((sub) => file(sub.getPath())) : null;
      },
      directory () {
         if (thing.type === 'none') {
            chain(io, (io, loop) => {
               const parent = io.getParentFile();
               parent && (parent.exists() || loop(parent));
               io.mkdir();
            });
         }
         return thing;
      },
      entry () {
         thing.type === 'none' && thing.parent.directory() && io.createNewFile();
         return thing;
      },
      get exists () {
         return io.exists();
      },
      file (...path) {
         return file(io, ...path);
      },
      flush () {
         chain(io, (io, loop) => {
            const parent = io.getParentFile();
            parent && parent.isDirectory() && (parent.listFiles()[0] || (parent.delete() && loop(parent)));
         });
         return thing;
      },
      io,
      json (async?: boolean) {
         if (async) {
            return sync(async () => thing.json());
         } else {
            try {
               return JSON.parse(thing.read());
            } catch (error) {
               return null;
            }
         }
      },
      get name () {
         return io.getName();
      },
      get parent () {
         return thing.file('..');
      },
      get path () {
         return io.getPath().replace(/(\\)/g, '/');
      },
      //@ts-expect-error
      read (async?: boolean) {
         if (async) {
            return sync(async () => thing.read());
         } else {
            return thing.type === 'file' ? new JavaString(Files.readAllBytes(io.toPath())).toString() : null;
         }
      },
      remove () {
         chain(io, (io, loop) => {
            io.isDirectory() && [ ...io.listFiles() ].forEach(loop);
            io.exists() && io.delete();
         });
         return thing.flush();
      },
      get type () {
         return io.isDirectory() ? 'folder' : io.exists() ? 'file' : 'none';
      },
      //@ts-expect-error
      write (content: string, async?: boolean) {
         if (async) {
            return sync(async () => thing.write(content));
         } else {
            thing.type === 'file' && Files.write(io.toPath(), new JavaString(content).getBytes());
            return thing;
         }
      }
   };
   return thing;
}

/** Trust me, this needs to be here. */
function sync<X> (script: (...args: any[]) => Promise<X>): Promise<X> {
   return new Promise((resolve, reject) => {
      Core.sync(() => script().then(resolve).catch(reject));
   });
}
