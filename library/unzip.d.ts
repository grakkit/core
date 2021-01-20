import { record } from './file';
import { jiFile, jiInputStream } from '@grakkit/core-classes';
export declare function unzip(from: jiInputStream, to: string | record | jiFile): Promise<void>;
