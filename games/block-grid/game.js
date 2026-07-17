(() => {
  'use strict';

  const size = 8;
  const pieces = [
    [[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [0, 1]],
    [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]
  ];
  const colors = ['cyan', 'pink', 'lime', 'orange'];
  const board = document.getElementById('board');
  const tray = document.getElementById('tray');
  const scoreNode = document.getElementById('score');
  const bestNode = document.getElementById('best');
  const message = document.getElementById('game-title');
  const overlay = document.getElementById('overlay');
  let cells, grid, options, selected = null, cursor = { x: 0, y: 0 }, score = 0, drag = null, suppressPieceClick = false;
  let best = Number(localStorage.getItem('webArcade.blockGrid.best') || 0);

  const announce = text => {
    message.textContent = text;
    const status = document.querySelector('[data-announcements]');
    if (status) status.textContent = text;
  };
  const randomPiece = () => ({ cells: pieces[Math.floor(Math.random() * pieces.length)], color: colors[Math.floor(Math.random() * colors.length)] });
  const cellAt = (x, y) => cells[y * size + x];

  function drawBoard() {
    cells = [];
    board.innerHTML = '';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Row ${y + 1}, column ${x + 1}`);
      cell.addEventListener('click', () => place(x, y));
      board.append(cell);
      cells.push(cell);
    }
    renderBoard();
  }

  function canPlace(piece, x, y) {
    return piece.cells.every(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < size && y + dy < size && !grid[y + dy][x + dx]);
  }

  function renderBoard() {
    cells.forEach(cell => {
      const x = +cell.dataset.x;
      const y = +cell.dataset.y;
      cell.className = `cell${grid[y][x] ? ` filled ${grid[y][x]}` : ''}${x === cursor.x && y === cursor.y ? ' cursor' : ''}`;
    });
    if (!selected) return;
    const valid = canPlace(selected, cursor.x, cursor.y);
    selected.cells.forEach(([dx, dy]) => {
      const x = cursor.x + dx;
      const y = cursor.y + dy;
      if (x >= 0 && y >= 0 && x < size && y < size) cellAt(x, y).classList.add(valid ? `preview ${selected.color}` : 'invalid');
    });
  }

  function selectPiece(piece) {
    selected = selected === piece ? null : piece;
    announce(selected ? 'Piece selected. Choose a square on the board, or drag the piece there.' : 'Choose a piece, then choose a square.');
    renderTray();
    renderBoard();
  }

  function boardCellFromPoint(clientX, clientY) {
    const boardRect = board.getBoundingClientRect();
    if (clientX < boardRect.left || clientX > boardRect.right || clientY < boardRect.top || clientY > boardRect.bottom) return null;
    const target = document.elementFromPoint(clientX, clientY);
    const cell = target && target.closest('.cell');
    return cell && board.contains(cell) ? { x: +cell.dataset.x, y: +cell.dataset.y } : null;
  }

  function nearestBlock(piece, button, clientX, clientY) {
    const blocks = [...button.querySelectorAll('i')];
    return blocks.reduce((nearest, block) => {
      const rect = block.getBoundingClientRect();
      const distance = (clientX - (rect.left + rect.width / 2)) ** 2 + (clientY - (rect.top + rect.height / 2)) ** 2;
      return !nearest || distance < nearest.distance ? { x: +block.style.gridColumn - 1, y: +block.style.gridRow - 1, distance } : nearest;
    }, null) || { x: piece.cells[0][0], y: piece.cells[0][1] };
  }

  function createDragPreview(piece, grab) {
    const firstCell = cellAt(0, 0).getBoundingClientRect();
    const secondCell = cellAt(1, 0).getBoundingClientRect();
    const maxX = Math.max(...piece.cells.map(([x]) => x)) + 1;
    const maxY = Math.max(...piece.cells.map(([, y]) => y)) + 1;
    const preview = document.createElement('div');
    const gap = secondCell.left - firstCell.right;
    preview.className = 'drag-preview';
    preview.style.setProperty('--cols', maxX);
    preview.style.setProperty('--rows', maxY);
    preview.style.setProperty('--drag-cell', `${firstCell.width}px`);
    preview.style.setProperty('--drag-gap', `${gap}px`);
    piece.cells.forEach(([x, y]) => {
      const block = document.createElement('i');
      block.className = piece.color;
      block.style.gridColumn = x + 1;
      block.style.gridRow = y + 1;
      preview.append(block);
    });
    document.body.append(preview);
    drag.preview = preview;
    drag.pointerOffset = {
      x: grab.x * (firstCell.width + gap) + firstCell.width / 2,
      y: grab.y * (firstCell.height + gap) + firstCell.height / 2
    };
  }

  function moveDragPreview(clientX, clientY) {
    if (!drag.preview) return;
    drag.preview.style.transform = `translate3d(${clientX - drag.pointerOffset.x}px, ${clientY - drag.pointerOffset.y}px, 0)`;
  }

  function startDrag(event) {
    drag.started = true;
    selected = drag.piece;
    drag.button.classList.add('dragging', 'selected');
    createDragPreview(drag.piece, drag.grab);
    document.body.classList.add('dragging-piece');
    announce('Drag the piece onto a square on the board.');
    moveDragPreview(event.clientX, event.clientY);
    updateDrag(event.clientX, event.clientY);
  }

  function updateDrag(clientX, clientY) {
    if (!drag || !drag.started) return null;
    moveDragPreview(clientX, clientY);
    const pointedCell = boardCellFromPoint(clientX, clientY);
    if (!pointedCell) return null;
    cursor = { x: pointedCell.x - drag.grab.x, y: pointedCell.y - drag.grab.y };
    renderBoard();
    return cursor;
  }

  function resetDrag() {
    if (!drag) return;
    drag.button.classList.remove('dragging');
    if (drag.preview) drag.preview.remove();
    document.body.classList.remove('dragging-piece');
    drag = null;
  }

  function suppressFollowingPieceClick() {
    suppressPieceClick = true;
    window.setTimeout(() => { suppressPieceClick = false; }, 0);
  }

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const activeDrag = drag;
    if (!activeDrag.started) {
      resetDrag();
      selectPiece(activeDrag.piece);
      suppressFollowingPieceClick();
      return;
    }
    const position = updateDrag(event.clientX, event.clientY);
    resetDrag();
    suppressFollowingPieceClick();
    if (position && canPlace(selected, position.x, position.y)) place(position.x, position.y);
    else {
      announce(position ? 'That piece does not fit there. It returned to the tray.' : 'Drop the piece on a square on the board.');
      renderTray();
      renderBoard();
    }
  }

  function cancelDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const wasDragging = drag.started;
    resetDrag();
    if (wasDragging) announce('Drag cancelled. The piece returned to the tray.');
    renderTray();
    renderBoard();
  }

  function renderTray() {
    tray.innerHTML = '';
    options.forEach((piece, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `piece${selected === piece ? ' selected' : ''}`;
      button.setAttribute('aria-pressed', selected === piece);
      button.setAttribute('aria-label', `Select piece ${index + 1}. Drag it onto the board to place it.`);
      if (!piece.used) {
        const maxX = Math.max(...piece.cells.map(([x]) => x)) + 1;
        const maxY = Math.max(...piece.cells.map(([, y]) => y)) + 1;
        button.style.setProperty('--cols', maxX);
        button.style.setProperty('--rows', maxY);
        piece.cells.forEach(([x, y]) => {
          const block = document.createElement('i');
          block.style.gridColumn = x + 1;
          block.style.gridRow = y + 1;
          block.className = piece.color;
          button.append(block);
        });
        button.addEventListener('pointerdown', event => {
          if ((event.pointerType === 'mouse' && event.button !== 0) || drag) return;
          event.preventDefault();
          button.focus();
          drag = { pointerId: event.pointerId, piece, button, startX: event.clientX, startY: event.clientY, started: false, grab: nearestBlock(piece, button, event.clientX, event.clientY) };
        });
        button.addEventListener('click', event => {
          if (suppressPieceClick) {
            suppressPieceClick = false;
            event.preventDefault();
            return;
          }
          selectPiece(piece);
        });
      } else {
        button.disabled = true;
        button.classList.add('used');
        button.setAttribute('aria-label', `Piece ${index + 1} used`);
      }
      tray.append(button);
    });
  }

  function clearLines() {
    const rows = [...Array(size).keys()].filter(y => grid[y].every(Boolean));
    const cols = [...Array(size).keys()].filter(x => grid.every(row => row[x]));
    rows.forEach(y => grid[y].fill(''));
    cols.forEach(x => grid.forEach(row => { row[x] = ''; }));
    return rows.length + cols.length;
  }

  function place(x, y) {
    if (!selected) {
      announce('Choose a piece first.');
      return;
    }
    if (!canPlace(selected, x, y)) {
      announce('That piece does not fit there. Try another square.');
      return;
    }
    selected.cells.forEach(([dx, dy]) => { grid[y + dy][x + dx] = selected.color; });
    const placed = selected.cells.length;
    selected.used = true;
    selected = null;
    const lines = clearLines();
    score += placed + lines * size * lines;
    scoreNode.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem('webArcade.blockGrid.best', best);
      bestNode.textContent = best;
    }
    announce(lines ? `${lines} line${lines > 1 ? 's' : ''} cleared! Choose another piece.` : 'Nice placement. Choose another piece.');
    if (options.every(piece => piece.used)) {
      options = [randomPiece(), randomPiece(), randomPiece()];
      announce('Fresh pieces ready. Choose a piece.');
    }
    renderTray();
    renderBoard();
    if (!hasMove()) endGame();
  }

  function hasMove() {
    return options.filter(piece => !piece.used).some(piece => [...Array(size)].some((_, y) => [...Array(size)].some((__, x) => canPlace(piece, x, y))));
  }

  function endGame() {
    document.getElementById('final-score').textContent = `You scored ${score} points. Best: ${best}.`;
    overlay.hidden = false;
    announce(`Game over. You scored ${score} points.`);
  }

  function reset() {
    resetDrag();
    grid = Array.from({ length: size }, () => Array(size).fill(''));
    options = [randomPiece(), randomPiece(), randomPiece()];
    selected = null;
    cursor = { x: 0, y: 0 };
    score = 0;
    scoreNode.textContent = '0';
    bestNode.textContent = best;
    overlay.hidden = true;
    announce('Choose a piece, then choose a square or drag it onto the board.');
    drawBoard();
    renderTray();
  }

  document.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      cursor.x = Math.max(0, Math.min(size - 1, cursor.x + (event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0)));
      cursor.y = Math.max(0, Math.min(size - 1, cursor.y + (event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0)));
      renderBoard();
    }
    if ((event.key === ' ' || event.key === 'Enter') && selected && document.activeElement.closest('.board, body')) {
      event.preventDefault();
      place(cursor.x, cursor.y);
    }
  });
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.started && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) startDrag(event);
    if (drag && drag.started) {
      event.preventDefault();
      updateDrag(event.clientX, event.clientY);
    }
  }, { passive: false });
  document.addEventListener('pointerup', finishDrag);
  document.addEventListener('pointercancel', cancelDrag);
  document.getElementById('restart').addEventListener('click', reset);
  document.getElementById('play-again').addEventListener('click', reset);
  reset();
})();
