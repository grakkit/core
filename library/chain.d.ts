export declare function chain<X, Y extends (input: X, chain: (object: X) => ReturnType<Y>) => any>(base: X, modifier: Y): void;
