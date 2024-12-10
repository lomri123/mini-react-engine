import { updateFunctionComponent, updateHostComponent } from './fiber';
import visualizer from '../visualizer';
import {
  wipRoot,
  setWipRoot,
  currentRoot,
  deletions,
  setDeletions,
  setCurrentRoot,
  nextUnitOfWork,
  setNextUnitOfWork,
} from './state';
import { updateDom } from './updater';

const workLoop = (deadline) => {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    setNextUnitOfWork(performUnitOfWork(nextUnitOfWork));
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

const commitRoot = () => {
  try {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    visualizer(wipRoot);
    setCurrentRoot(wipRoot);
  } catch (error) {
    console.error('Error in commit:', error);
  } finally {
    setWipRoot(null);
  }
};

const commitWork = (fiber) => {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber ? domParentFiber.dom : null;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    if (domParent) {
      domParent.appendChild(fiber.dom);
    }
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitDeletion = (fiber, domParent) => {
  if (!fiber) return;

  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    let child = fiber.child;
    while (child) {
      commitDeletion(child, domParent);
      child = child.sibling;
    }
  }
};

const performUnitOfWork = (fiber) => {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
};

export const render = (element, container) => {
  setWipRoot({
    dom: container,
    props: { children: [element] },
    alternate: currentRoot,
  });
  setDeletions([]);
  setNextUnitOfWork(wipRoot);
};

requestIdleCallback(workLoop);
