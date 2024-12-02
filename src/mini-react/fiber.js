import { createDom } from './builder';
import { wipFiber, setWipFiber, setHookIndex } from './state';

export const havePropsChanged = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  for (let key of prevKeys) {
    if (key === 'children') {
      const prevChildren = prevProps.children || [];
      const nextChildren = nextProps.children || [];

      if (prevChildren.length !== nextChildren.length) {
        return true;
      }

      for (let i = 0; i < prevChildren.length; i++) {
        const prevChild = prevChildren[i];
        const nextChild = nextChildren[i];

        if (typeof prevChild === 'object' && typeof nextChild === 'object') {
          if (
            prevChild.type !== nextChild.type ||
            havePropsChanged(prevChild.props, nextChild.props)
          ) {
            return true;
          }
        } else if (prevChild !== nextChild) {
          return true;
        }
      }
    } else if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
};

export const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type === oldFiber.type;

    let newFiber = null;

    if (sameType) {
      const propsChanged = havePropsChanged(oldFiber.props, element.props);
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: propsChanged ? 'UPDATE' : null,
      };
    } else if (element) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
};

export const updateFunctionComponent = (fiber) => {
  setWipFiber(fiber);
  setHookIndex(0);
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

export const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const children =
    fiber.props && fiber.props.children ? fiber.props.children : [];
  reconcileChildren(fiber, children);
};
