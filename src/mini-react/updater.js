const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

const memoizedEventListeners = new WeakMap();

export const updateDom = (dom, prevProps = {}, nextProps = {}) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      const prevHandler = memoizedEventListeners.get(dom)?.[eventType];
      if (prevHandler) {
        dom.removeEventListener(eventType, prevHandler);
      }
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      const handler = nextProps[name];

      if (!memoizedEventListeners.has(dom)) {
        memoizedEventListeners.set(dom, {});
      }
      memoizedEventListeners.get(dom)[eventType] = handler;
      dom.addEventListener(eventType, handler);
    });

  const updates = {};

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      updates[name] = '';
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      updates[name] = nextProps[name];
    });

  requestAnimationFrame(() => {
    Object.entries(updates).forEach(([name, value]) => {
      dom[name] = value;
    });
  });

  if (dom.nodeType === Node.TEXT_NODE) {
    const newValue = nextProps.nodeValue || '';
    if (dom.nodeValue !== newValue) {
      dom.nodeValue = newValue;
    }
  }
};
