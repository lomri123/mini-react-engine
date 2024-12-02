import './index.css';
import List from './List';
import { createElement, render } from './mini-react/index';

/** @jsx createElement */
function App() {
  return (
    <div>
      <h1>Draggable Todo List</h1>
      <List />
    </div>
  );
}

const element = <App />;
const root = document.getElementById('root');
render(element, root);
