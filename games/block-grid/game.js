(() => {
  'use strict';

  const width = 10;
  const height = 10;
  const colors = ['cyan', 'pink', 'lime', 'orange', 'violet'];
  const board = document.getElementById('board');
  const scoreNode = document.getElementById('score');
  const bestNode = document.getElementById('best');
  const remainingNode = document.getElementById('remaining');
  const message = document.getElementById('game-title');
  const overlay = document.getElementById('overlay');
  let grid = [];
  let cells = [];
  let score = 0;
  let best = Number(localStorage.getItem('webArcade.blockGrid.best') || 0);

  const announce = text => {
    message.textContent = text;
    const status = document.querySelector('[data-announcements]');
    if (status) {
      status.textContent = '';
      window.setTimeout(() => { status.textContent = text; }, 20);
    }
  };
  const at = (x, y) => grid[y] && grid[y][x];
  const cellAt = (x, y) => cells[y * width + x];

  function groupAt(x, y) {
    const color = at(x, y);
    if (!color) return [];
    const seen = new Set();
    const group = [];
    const pending = [[x, y]];
    while (pending.length) {
      const [nextX, nextY] = pending.pop();
      const key = `${nextX},${nextY}`;
      if (seen.has(key) || at(nextX, nextY) !== color) continue;
      seen.add(key);
      group.push([nextX, nextY]);
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
        if (nextX + dx >= 0 && nextX + dx < width && nextY + dy >= 0 && nextY + dy < height) pending.push([nextX + dx, nextY + dy]);
      });
    }
    return group;
  }

  function render() {
    cells.forEach(cell => {
      const x = Number(cell.dataset.x);
      const y = Number(cell.dataset.y);
      const color = at(x, y);
      cell.className = `cell${color ? ` filled ${color}` : ' empty'}`;
      cell.disabled = !color;
      cell.setAttribute('aria-label', color ? `${color} block, row ${y + 1}, column ${x + 1}. ${groupAt(x, y).length} connected.` : `Empty square, row ${y + 1}, column ${x + 1}`);
    });
    remainingNode.textContent = grid.flat().filter(Boolean).length;
  }

  function drawBoard() {
    board.innerHTML = '';
    cells = [];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute('role', 'gridcell');
      cell.addEventListener('click', () => clearGroup(x, y));
      cell.addEventListener('keydown', event => moveFocus(event, x, y));
      board.append(cell);
      cells.push(cell);
    }
    render();
  }

  function settle() {
    for (let x = 0; x < width; x++) {
      const blocks = grid.map(row => row[x]).filter(Boolean);
      for (let y = height - 1, i = blocks.length - 1; y >= 0; y--, i--) grid[y][x] = i >= 0 ? blocks[i] : '';
    }
    const columns = Array.from({ length: width }, (_, x) => grid.map(row => row[x])).filter(column => column.some(Boolean));
    grid = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => columns[x] ? columns[x][y] : ''));
  }

  function clearGroup(x, y) {
    const group = groupAt(x, y);
    if (group.length < 2) {
      announce('That block needs a matching neighbor. Choose a group of two or more.');
      return;
    }
    group.forEach(([blockX, blockY]) => { grid[blockY][blockX] = ''; });
    settle();
    const points = group.length * group.length;
    score += points;
    scoreNode.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem('webArcade.blockGrid.best', String(best));
      bestNode.textContent = best;
    }
    render();
    const left = grid.flat().filter(Boolean).length;
    if (!left) {
      document.getElementById('final-score').textContent = `You cleared the grid with ${score} points. Best: ${best}.`;
      overlay.hidden = false;
      announce(`Grid cleared! ${group.length} blocks earned ${points} points. Final score: ${score}.`);
    } else {
      announce(`${group.length} blocks cleared for ${points} points. ${left} blocks remain.`);
    }
  }

  function moveFocus(event, x, y) {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!moves[event.key]) return;
    event.preventDefault();
    const [dx, dy] = moves[event.key];
    let nextX = x + dx;
    let nextY = y + dy;
    while (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height && !at(nextX, nextY)) {
      nextX += dx;
      nextY += dy;
    }
    if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) cellAt(nextX, nextY).focus();
  }

  function hasGroup() {
    return grid.some((row, y) => row.some((color, x) => color && groupAt(x, y).length > 1));
  }

  function newGrid() {
    // A limited palette deliberately creates clusters while retaining a varied board.
    do {
      grid = Array.from({ length: height }, () => Array.from({ length: width }, () => colors[Math.floor(Math.random() * colors.length)]));
    } while (!hasGroup());
    return grid;
  }

  function reset() {
    grid = newGrid();
    score = 0;
    scoreNode.textContent = '0';
    bestNode.textContent = best;
    overlay.hidden = true;
    drawBoard();
    announce('Choose a group of two or more matching blocks. Larger groups earn more points.');
  }

  document.getElementById('restart').addEventListener('click', reset);
  document.getElementById('play-again').addEventListener('click', reset);
  reset();
})();
