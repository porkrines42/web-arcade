(() => {
  'use strict';
  const key = 'webArcade.patrolChart';
  const defaultData = { version: 2, anchor: '', firstBreak: 2, vacations: [], notes: {} };
  const read = () => { try { const saved = JSON.parse(localStorage.getItem(key)); return { ...defaultData, ...(saved && typeof saved === 'object' ? saved : {}), vacations: Array.isArray(saved && saved.vacations) ? saved.vacations : [], notes: saved && saved.notes && typeof saved.notes === 'object' && !Array.isArray(saved.notes) ? saved.notes : {} }; } catch (_) { return { ...defaultData }; } };
  let data = read(), display = new Date(), activeDate = '', opener = null; display = new Date(display.getFullYear(), display.getMonth(), 1);
  const grid = document.getElementById('calendar-grid'), title = document.getElementById('month-title'), note = document.getElementById('calendar-note');
  const form = document.getElementById('schedule-form'), anchorInput = document.getElementById('anchor-date');
  const announce = message => { const node = document.querySelector('[data-announcements]'); if (node) node.textContent = message; };
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const utcDay = value => Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000);
  const parseISO = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const dateLabel = date => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  function stateFor(date) { if (!data.anchor) return 'unknown'; const position = mod(utcDay(date) - utcDay(parseISO(data.anchor)), 15), first = Number(data.firstBreak) === 3 ? 3 : 2; const off = first === 2 ? (position >= 5 && position <= 6) || position >= 12 : (position >= 5 && position <= 7) || position >= 13; return off ? 'off' : data.vacations.includes(iso(date)) ? 'vacation' : 'work'; }
  function save() { localStorage.setItem(key, JSON.stringify(data)); }
  function openModal(id, nextOpener) { const modal = document.getElementById(id); opener = nextOpener; modal.hidden = false; document.body.classList.add('modal-open'); const first = modal.querySelector('input, textarea, button'); if (first) first.focus(); }
  function closeModal(id) { document.getElementById(id).hidden = true; document.body.classList.remove('modal-open'); if (opener) opener.focus(); }
  function render() {
    title.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(display);
    note.textContent = data.anchor ? `Day 1: ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(parseISO(data.anchor))}. Use Add vacation for time away; select a calendar date to manage its note.` : 'Set a Day 1 work date to calculate your patrol rotation. You can still select dates to add notes.';
    grid.innerHTML = '';
    for (let blank = 0; blank < display.getDay(); blank += 1) { const cell = document.createElement('div'); cell.className = 'calendar-blank'; cell.setAttribute('aria-hidden', 'true'); grid.append(cell); }
    const last = new Date(display.getFullYear(), display.getMonth() + 1, 0).getDate(), today = iso(new Date());
    for (let day = 1; day <= last; day += 1) { const date = new Date(display.getFullYear(), display.getMonth(), day), state = stateFor(date), dateISO = iso(date), hasNote = Boolean(data.notes[dateISO]); const button = document.createElement('button'); button.type = 'button'; button.className = `calendar-day ${state}${today === dateISO ? ' today' : ''}${hasNote ? ' has-note' : ''}`; button.innerHTML = `<span class="day-number">${day}</span><span class="day-status">${state === 'unknown' ? 'Set schedule' : state === 'off' ? 'Day off' : state === 'vacation' ? 'Vacation' : 'Work'}</span>${hasNote ? '<span class="note-indicator" aria-hidden="true">●</span>' : ''}`; button.setAttribute('role', 'gridcell'); button.setAttribute('aria-label', `${dateLabel(date)}: ${state === 'unknown' ? 'schedule not set' : state}. ${hasNote ? 'Has a note. ' : ''}Open note.`); button.addEventListener('click', () => openNote(dateISO, dateLabel(date), button)); grid.append(button); }
  }
  function openNote(dateISO, label, button) { activeDate = dateISO; document.getElementById('note-title').textContent = label; document.getElementById('note-text').value = data.notes[dateISO] || ''; document.getElementById('delete-note').hidden = !data.notes[dateISO]; openModal('note-modal', button); }
  document.getElementById('schedule-button').addEventListener('click', event => { anchorInput.value = data.anchor; form.elements['first-break'].value = String(data.firstBreak); openModal('schedule-modal', event.currentTarget); });
  document.getElementById('vacation-button').addEventListener('click', event => { const today = iso(new Date()); document.getElementById('vacation-start').value = today; document.getElementById('vacation-end').value = today; openModal('vacation-modal', event.currentTarget); });
  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.closeModal)));
  document.querySelectorAll('.chart-modal').forEach(modal => { modal.addEventListener('click', event => { if (event.target === modal) closeModal(modal.id); }); modal.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(modal.id); }); });
  form.addEventListener('submit', event => { event.preventDefault(); data.anchor = anchorInput.value; data.firstBreak = Number(form.elements['first-break'].value); save(); closeModal('schedule-modal'); render(); announce('Patrol schedule saved on this device.'); });
  document.getElementById('vacation-form').addEventListener('submit', event => { event.preventDefault(); const start = document.getElementById('vacation-start').value, end = document.getElementById('vacation-end').value; if (end < start) { announce('Choose an end date that is on or after the start date.'); return; } const vacationDays = []; for (let date = parseISO(start); iso(date) <= end; date.setDate(date.getDate() + 1)) if (stateFor(date) !== 'off') vacationDays.push(iso(date)); data.vacations = [...new Set([...data.vacations, ...vacationDays])]; save(); closeModal('vacation-modal'); render(); announce(`${vacationDays.length} vacation day${vacationDays.length === 1 ? '' : 's'} added. Regular days off were kept.`); });
  document.getElementById('note-form').addEventListener('submit', event => { event.preventDefault(); const value = document.getElementById('note-text').value.trim(); if (value) data.notes[activeDate] = value; else delete data.notes[activeDate]; save(); closeModal('note-modal'); render(); announce(value ? 'Note saved.' : 'Note deleted.'); });
  document.getElementById('delete-note').addEventListener('click', () => { delete data.notes[activeDate]; save(); closeModal('note-modal'); render(); announce('Note deleted.'); });
  document.getElementById('previous-month').addEventListener('click', () => { display.setMonth(display.getMonth() - 1); render(); }); document.getElementById('next-month').addEventListener('click', () => { display.setMonth(display.getMonth() + 1); render(); }); document.getElementById('today-button').addEventListener('click', () => { const now = new Date(); display = new Date(now.getFullYear(), now.getMonth(), 1); render(); });
  render();
})();
