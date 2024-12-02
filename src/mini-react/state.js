export let wipFiber = null;
export let hookIndex = null;
export let wipRoot = null;
export let currentRoot = null;
export let deletions = [];
export let nextUnitOfWork = null;

export const setWipFiber = (fiber) => (wipFiber = fiber);
export const setHookIndex = (index) => (hookIndex = index);
export const setWipRoot = (root) => (wipRoot = root);
export const setCurrentRoot = (root) => (currentRoot = root);
export const setDeletions = (del) => (deletions = del);
export const setNextUnitOfWork = (fiber) => (nextUnitOfWork = fiber);
