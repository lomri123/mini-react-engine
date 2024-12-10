import {
  currentRoot,
  hookIndex,
  setHookIndex,
  wipFiber,
  setWipRoot,
  setDeletions,
  setNextUnitOfWork,
} from './state';

export const useState = (initial) => {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];

  const hook = {
    state: oldHook
      ? oldHook.state
      : typeof initial === 'function'
      ? initial()
      : initial,
    queue: [],
  };

  const actions = oldHook ? [...oldHook.queue] : [];
  actions.forEach((action) => {
    hook.state = typeof action === 'function' ? action(hook.state) : action;
  });

  const setState = (action) => {
    const newAction = typeof action === 'function' ? action : () => action;
    hook.queue.push(newAction);

    const newWipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };

    setWipRoot(newWipRoot);
    setNextUnitOfWork(newWipRoot);
    setDeletions([]);
  };

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);
  return [hook.state, setState];
};
