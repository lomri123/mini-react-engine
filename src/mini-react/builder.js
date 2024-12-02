import { updateDom } from './updater';

export const TEXT_ELEMENT = 'TEXT_ELEMENT';

export const createElement = (type, props, ...children) => {
  const flatChildren = children.flat(Infinity);
  return {
    type,
    props: {
      ...props,
      children: flatChildren.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
};

export const createTextElement = (text) => ({
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: text,
    children: [],
  },
});

export const createDom = (fiber) => {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);
  return dom;
};
