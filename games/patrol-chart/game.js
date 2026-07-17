(() => {
  'use strict';
  const key = 'webArcade.patrolChart';
  const defaultData = { version: 1, anchor: '', firstBreak: 2, vacations: [] };
  const read = () => { try { const saved = JSON.parse(localStorage.getItem(key)); return { ...defaultData, ...(saved && typeof saved === 'object' ? saved : {}), vacations: Array.isArray(saved && saved.vacations) ? saved.vacations : [] }; } catch (_) { return { ...defaultData }; } };
  let data = read();
  let display = new Date(); display = new Date(display.getFullYear(), display.getMonth(), 1);
  const grid = document.getElementById('calendar-grid'), title = document.getElementById('month-title'), note = document.getElementById('calendar-note');
  const panel = document.getElementById('schedule-panel'), scheduleButton = document.getElementById('schedule-button'), form = document.getElementById('schedule-form'), anchorInput = document.getElementById('anchor-date');
  const announce = message => { const node = document.querySelector('[data-announcements]'); if (node) node.textContent = message; };
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const utcDay = value => Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000);
  const parseISO = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  function stateFor(date) {
    if (!data.anchor) return 'unknown';
    const position = mod(utcDay(date) - utcDay(parseISO(data.anchor)), 15);
    const first = Number(data.firstBreak) === 3 ? 3 : 2;
    const off = first === 2 ? (position >= 5 && position <= 6) || position >= 12 : (position >= 5 && position <= 7) || position >= 13;
    return data.vacations.includes(iso(date)) ? 'vacation' : off ? 'off' : 'work';
  }
  function save() { localStorage.setItem(key, JSON.stringify(data)); }
  function render() {
    title.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(display);
    note.textContent = data.anchor ? `Day 1: ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(parseISO(data.anchor))}. Select a day to ${data.vacations.length ? 'manage vacation time.' : 'add vacation time.'}` : 'Set a Day 1 work date to calculate your patrol rotation.';
    grid.innerHTML = '';
    for (let blank = 0; blank < display.getDay(); blank += 1) { const cell = document.createElement('div'); cell.className = 'calendar-blank'; cell.setAttribute('aria-hidden', 'true'); grid.append(cell); }
    const last = new Date(display.getFullYear(), display.getMonth() + 1, 0).getDate(); const today = iso(new Date());
    for (let day = 1; day <= last; day += 1) { const date = new Date(display.getFullYear(), display.getMonth(), day), state = stateFor(date), dateISO = iso(date); const button = document.createElement('button'); button.type = 'button'; button.className = `calendar-day ${state}${today === dateISO ? ' today' : ''}`; button.disabled = state === 'unknown'; button.innerHTML = `<span class="day-number">${day}</span><span class="day-status">${state === 'unknown' ? 'Set schedule' : state === 'vacation' ? 'Vacation' : state === 'off' ? 'Day off' : 'Work'}</span>`; button.setAttribute('role', 'gridcell'); button.setAttribute('aria-label', `${new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)}: ${state === 'off' ? 'day off' : state}. ${state === 'vacation' ? 'Remove vacation.' : 'Toggle vacation.'}`); button.addEventListener('click', () => { data.vacations = data.vacations.includes(dateISO) ? data.vacations.filter(value => value !== dateISO) : [...data.vacations, dateISO]; save(); render(); announce(`${dateISO} ${data.vacations.includes(dateISO) ? 'added as vacation.' : 'removed from vacation.'}`); }); grid.append(button); }
  }
  scheduleButton.addEventListener('click', () => { panel.hidden = !panel.hidden; scheduleButton.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) { anchorInput.value = data.anchor; anchorInput.focus(); } });
  form.addEventListener('submit', event => { event.preventDefault(); data.anchor = anchorInput.value; data.firstBreak = Number(form.elements['first-break'].value); save(); panel.hidden = true; scheduleButton.setAttribute('aria-expanded', 'false'); render(); announce('Patrol schedule saved.'); });
  document.getElementById('previous-month').addEventListener('click', () => { display.setMonth(display.getMonth() - 1); render(); });
  document.getElementById('next-month').addEventListener('click', () => { display.setMonth(display.getMonth() + 1); render(); });
  document.getElementById('today-button').addEventListener('click', () => { const now = new Date(); display = new Date(now.getFullYear(), now.getMonth(), 1); render(); });
  form.elements['first-break'].value = String(data.firstBreak); render();
})();
