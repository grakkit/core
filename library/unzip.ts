import { sync } from './core';
import { type } from './type';
import { file, record } from './file';
import { jiFile, jiInputStream, juzZipEntry } from '@grakkit/core-classes';

const FileOutputStream = type('java.io.FileOutputStream');
const ZipInputStream = type('java.util.zip.ZipInputStream');

export function unzip (from: jiInputStream, to: string | record | jiFile) {
   return sync(async () => {
      to = file(to);
      let entry: juzZipEntry;
      const stream = new ZipInputStream(from);
      try {
         while ((entry = stream.getNextEntry())) {
            try {
               const target = to.file(entry.getName());
               if (entry.isDirectory()) {
                  target.directory();
               } else {
                  const output = new FileOutputStream(target.entry().io);
                  try {
                     stream.transferTo(output);
                     output.close();
                  } catch (error) {
                     output.close();
                     throw error;
                  }
               }
               stream.closeEntry();
            } catch (error) {
               stream.closeEntry();
               throw error;
            }
         }
         stream.close();
         from.close();
      } catch (error) {
         stream.close();
         from.close();
         throw error;
      }
   });
}
