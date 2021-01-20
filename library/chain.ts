export function chain<X, Y extends (input: X, chain: (object: X) => ReturnType<Y>) => any> (base: X, modifier: Y) {
   const chain = (object: X) => modifier(object, chain);
   chain(base);
}
