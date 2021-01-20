import { jiFile } from '@grakkit/core-classes';
export declare type record = {
    readonly children: record[];
    directory(): record;
    entry(): record;
    readonly exists: boolean;
    file(...sub: string[]): record;
    flush(): record;
    io: jiFile;
    json(async?: false): any;
    json(async: true): Promise<any>;
    readonly name: string;
    readonly path: string;
    readonly parent: record;
    read(async?: false): string;
    read(async: true): Promise<string>;
    remove(): record;
    readonly type: 'folder' | 'file' | 'none';
    write(content: string, async?: false): record;
    write(content: string, async: true): Promise<record>;
};
export declare function file(path: string | record | jiFile, ...more: string[]): record;
