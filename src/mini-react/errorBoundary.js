import { createElement } from './builder';

export class ErrorBoundary {
  constructor(props) {
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return createElement(
        'div',
        { className: 'error-boundary' },
        'Something went wrong.'
      );
    }
    return this.props.children;
  }
}

export const DefaultErrorUI = ({ error, resetError }) => {
  return createElement(
    'div',
    { className: 'error-ui' },
    createElement('h2', null, 'Something went wrong'),
    createElement('p', null, error?.message || 'Unknown error occurred'),
    resetError && createElement('button', { onClick: resetError }, 'Try again')
  );
};
