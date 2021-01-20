import { jiInputStream, jnHttpURLConnection } from '@grakkit/core-classes';
export declare type response = {
    net: jnHttpURLConnection;
    json(async?: false): any;
    json(async: true): Promise<any>;
    read(async?: false): string;
    read(async: true): Promise<string>;
    stream(async?: false): jiInputStream;
    stream(async: true): Promise<jiInputStream>;
};
export declare function fetch(link: string): response;
