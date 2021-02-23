export const synchronous = (callback: Function) => {
  callback();
}

export const macrotask = (callback: Function) => {
  if (typeof process == 'object') {
    process.nextTick(() => callback());
  } else {
    Promise.resolve()
      .then(() => {})
      .then(() => callback());
  }
}

export const microtask = (callback: Function) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => callback());
  } else {
    Promise.resolve().then(() => {
      callback();
    });
  }
}

export const task = (callback: Function) => {
  if (typeof MessageChannel === 'function') {
    const mc = new MessageChannel();
    mc.port1.postMessage(null);
    mc.port2.addEventListener("message", () => {
      callback();

      mc.port1.close();
      mc.port2.close();
    }, { once: true })
    mc.port2.start();
  } else {
    setTimeout(() => callback(), 0);
  }
};

