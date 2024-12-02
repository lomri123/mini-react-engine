import { useState, createElement } from './mini-react';

/** @jsx createElement */
function List() {
  const [items, setItems] = useState([
    { id: 1, text: 'Learn JavaScript' },
    { id: 2, text: 'Master React' },
    { id: 3, text: 'Build Projects' },
    { id: 4, text: 'Get a Job' },
  ]);

  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  const [newItem, setNewItem] = useState('');

  const handleDragStart = (index) => (e) => {
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        index,
        id: items[index].id,
        text: items[index].text,
      })
    );
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDragOverItemIndex(null);
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItemIndex(index);
  };

  const handleDragLeave = (e) => {
    setDragOverItemIndex(null);
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();

    const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const draggedIndex = draggedData.index;

    if (draggedIndex === index) return;

    setItems((prevItems) => {
      const newItems = [...prevItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, removed);
      return newItems;
    });

    setDragOverItemIndex(null);
  };

  const handleCreate = () => {
    if (newItem.trim()) {
      setItems((prevItems) => [
        ...prevItems,
        { id: Date.now(), text: newItem.trim() },
      ]);
      setNewItem('');
    }
  };

  return (
    <div
      className='list-container'
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
    >
      <h2 className='list-header'>My tasks</h2>
      <div>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder='Add new item'
        />
        <button onClick={handleCreate}>Add</button>
      </div>
      <ul className='list-items'>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`list-item ${
              index === dragOverItemIndex ? 'list-item-dragover' : ''
            }`}
            draggable='true'
            onDragStart={handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver(index)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(index)}
          >
            <span className='list-item-index'>{index + 1}.</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default List;
