import { jiFile } from '@grakkit/core-classes';
import { record } from './file';
export declare function transfer(from: string | record | jiFile, to: string | record | jiFile, operation: 'move' | 'copy'): Promise<void>;
