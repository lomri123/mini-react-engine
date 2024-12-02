import * as d3 from 'd3';

const visualizer = (fiber) => {
  let container = document.getElementById('engine-visualization');

  if (!container) {
    container = document.createElement('div');
    container.id = 'engine-visualization';
    document.body.appendChild(container);
  }

  container.innerHTML = '';

  if (!fiber) {
    container.innerHTML = '<p>No engine state to display.</p>';
    return;
  }

  const data = transformFiberNode(fiber);

  const margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([height, width]);
  treeLayout(root);

  g.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr(
      'd',
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    );

  const node = g
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr(
      'class',
      (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf')
    )
    .attr('transform', (d) => 'translate(' + d.y + ',' + d.x + ')');

  node
    .append('circle')
    .attr('r', 10)
    .style('fill', (d) => getColorByEffect(d.data.effectTag));

  node
    .append('text')
    .attr('dy', '.35em')
    .attr('x', (d) => (d.children ? -15 : 15))
    .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
    .text((d) => d.data.name);
};

const getColorByEffect = (effectTag) => {
  switch (effectTag) {
    case 'PLACEMENT':
      return 'green';
    case 'DELETION':
      return 'red';
    case 'UPDATE':
      return 'orange';
    default:
      return 'steelblue';
  }
};

const transformFiberNode = (fiberNode) => {
  if (!fiberNode || fiberNode.type === 'TEXT_ELEMENT') return null;

  let name = '';
  if (typeof fiberNode.type === 'string') {
    name = fiberNode.type;
  } else if (fiberNode.type?.displayName) {
    name = fiberNode.type.displayName;
  } else if (fiberNode.type?.name) {
    name = fiberNode.type.name;
  } else {
    name = 'root';
  }

  if (name.startsWith('function') || name.length > 100) {
    return null;
  }

  const node = {
    name,
    effectTag: fiberNode.effectTag || 'None',
    children: [],
  };

  if (fiberNode.child) {
    const childNodes = transformFiberNodes(fiberNode.child);
    if (childNodes.length > 0) {
      node.children = node.children.concat(childNodes);
    }
  }

  return node;
};

const transformFiberNodes = (fiberNode) => {
  const nodes = [];
  let currentFiber = fiberNode;
  while (currentFiber) {
    if (currentFiber.type !== 'TEXT_ELEMENT') {
      const transformedNode = transformFiberNode(currentFiber);
      if (transformedNode) {
        nodes.push(transformedNode);
      }
    }
    currentFiber = currentFiber.sibling;
  }
  return nodes;
};

export default visualizer;
