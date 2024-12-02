import {
  currentRoot,
  hookIndex,
  setHookIndex,
  wipFiber,
  wipRoot,
  setWipRoot,
  deletions,
  setDeletions,
  setNextUnitOfWork,
} from './state';

export const useState = (initial) => {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];

  let hook;

  if (oldHook) {
    hook = oldHook;
  } else {
    hook = {
      state: initial,
      queue: [],
    };
  }

  hook.queue.forEach((action) => {
    hook.state = action(hook.state);
  });

  hook.queue = [];

  const setState = (action) => {
    hook.queue.push(typeof action === 'function' ? action : () => action);
    const newWipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    setWipRoot(newWipRoot);
    setNextUnitOfWork(newWipRoot);
    setDeletions([]);
  };

  if (!hook.setState) {
    hook.setState = setState;
  }

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);
  return [hook.state, hook.setState];
};
