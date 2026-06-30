const prefetched = new Set();

export function prefetch(factory) {
  const key = factory.toString();
  if (prefetched.has(key)) return;
  prefetched.add(key);
  requestIdleCallback(() => factory(), { timeout: 2000 });
}

export function prefetchOnHover(factory) {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    prefetch(factory);
  };
}
