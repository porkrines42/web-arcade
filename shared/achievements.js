(function () {
  'use strict';
  const KEY = 'webArcade.achievements', VERSION = 1;
  const definitions = [
    { id: 'first-serve', title: 'First Serve', description: 'Start your first Pong match.' },
    { id: 'first-victory', title: 'First Victory', description: 'Win your first Pong match.' },
    { id: 'clean-sweep', title: 'Clean Sweep', description: 'Win a Pong match 7–0.' },
    { id: 'comeback', title: 'Comeback', description: 'Win after trailing by at least 3 points.' },
    { id: 'on-a-roll', title: 'On a Roll', description: 'Win 3 Pong matches in a row.', goal: 3 },
    { id: 'hard-earned', title: 'Hard Earned', description: 'Win a Pong match on Hard difficulty.' },
    { id: 'arcade-regular', title: 'Arcade Regular', description: 'Complete 10 Pong matches.', goal: 10 },
    { id: 'point-collector', title: 'Point Collector', description: 'Score 100 player points in Pong.', goal: 100 }
  ];
  function read() { try { const x = JSON.parse(localStorage.getItem(KEY) || '{}'); return { version: VERSION, unlocked: x.unlocked && typeof x.unlocked === 'object' ? x.unlocked : {} }; } catch (_) { return { version: VERSION, unlocked: {} }; } }
  function save(value) { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {} }
  function unlock(id) { const value = read(); if (value.unlocked[id]) return false; value.unlocked[id] = new Date().toISOString(); save(value); window.dispatchEvent(new CustomEvent('webarcade:achievement', { detail: definitions.find(item => item.id === id) })); window.dispatchEvent(new CustomEvent('webarcade:achievementschange')); return true; }
  function evaluate(event, result) { const p = window.WebArcadeStats.get().pong; if (event === 'start' && p.matchesStarted >= 1) unlock('first-serve'); if (event === 'complete') { if (result.won && p.matchesWon >= 1) unlock('first-victory'); if (result.won && result.playerScore === 7 && result.cpuScore === 0) unlock('clean-sweep'); if (result.won && result.maxDeficit >= 3) unlock('comeback'); if (p.currentWinStreak >= 3) unlock('on-a-roll'); if (result.won && result.difficulty === 'hard') unlock('hard-earned'); if (p.matchesCompleted >= 10) unlock('arcade-regular'); } if (p.playerPoints >= 100) unlock('point-collector'); }
  function progress(def, p) { if (def.id === 'on-a-roll') return [Math.min(p.currentWinStreak, 3), 3]; if (def.id === 'arcade-regular') return [Math.min(p.matchesCompleted, 10), 10]; if (def.id === 'point-collector') return [Math.min(p.playerPoints, 100), 100]; return null; }
  function notify(item) { if (!item || typeof document === 'undefined' || !document.body) return; const node = document.createElement('div'); node.className = 'achievement-toast'; node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); node.innerHTML = '<strong>Achievement unlocked</strong><span>' + item.title + '</span>'; document.body.append(node); if (!window.WebArcade || !window.WebArcade.motionOff()) node.classList.add('is-visible'); window.setTimeout(() => node.remove(), 4200); }
  window.addEventListener('webarcade:achievement', event => notify(event.detail));
  window.WebArcadeAchievements = { key: KEY, definitions, get: read, reset: () => { try { localStorage.removeItem(KEY); } catch (_) {} window.dispatchEvent(new CustomEvent('webarcade:achievementschange')); }, evaluate, progress };
}());
