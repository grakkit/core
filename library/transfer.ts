import { type } from './type';
import { sync } from './core';
import { chain } from './chain';
import { jiFile } from '@grakkit/core-classes';
import { file, record } from './file';

const Files = type('java.nio.file.Files');
const StandardCopyOption = type('java.nio.file.StandardCopyOption');

export function transfer (from: string | record | jiFile, to: string | record | jiFile, operation: 'move' | 'copy') {
   return sync(async () => {
      from = typeof from === 'string' ? file(from).io : 'io' in from ? from.io : from;
      to = typeof to === 'string' ? file(to).io : 'io' in to ? to.io : to;
      chain([ from, to ], (io, loop) => {
         if (io[0].isDirectory()) {
            file(io[1].getPath()).directory();
            for (const from of [ ...io[0].listFiles() ]) loop([ from, file(io[1].getPath(), from.getName()).io ]);
         } else if (io[0].exists() && !io[1].exists()) {
            Files[operation](
               io[0].toPath(),
               io[1].toPath(),
               StandardCopyOption.COPY_ATTRIBUTES,
               StandardCopyOption.REPLACE_EXISTING
            );
         }
      });
   });
}
