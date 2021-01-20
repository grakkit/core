export declare const root: import("./file").record;
export declare function hook(script: Function): void;
export declare function push(script: Function): void;
export declare function sync<X>(script: (...args: any[]) => Promise<X>): Promise<X>;
