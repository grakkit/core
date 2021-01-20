export declare type task = {
    tick: number;
    args: any[];
    script: Function;
};
export declare function cancel(handle: task): void;
export declare function interval(script: Function, period?: number, ...args: any[]): {
    tick: number;
    args: any[];
    script: Function;
};
export declare function timeout(script: Function, period?: number, ...args: any[]): {
    tick: number;
    args: any[];
    script: Function;
};
