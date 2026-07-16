(function () {
  'use strict';
  const KEY = 'webArcade.stats';
  const VERSION = 1;
  const base = () => ({ version: VERSION, pong: { matchesStarted: 0, matchesCompleted: 0, matchesWon: 0, matchesLost: 0, playerPoints: 0, cpuPoints: 0, currentWinStreak: 0, bestWinStreak: 0, winsByDifficulty: { easy: 0, normal: 0, hard: 0 }, lossesByDifficulty: { easy: 0, normal: 0, hard: 0 }, lastPlayed: null, playTimeSeconds: 0 } });
  function read() { try { const saved = JSON.parse(localStorage.getItem(KEY) || '{}'); const value = base(), pong = saved.pong || {}; Object.assign(value.pong, pong); ['easy', 'normal', 'hard'].forEach(level => { value.pong.winsByDifficulty[level] = Number(pong.winsByDifficulty && pong.winsByDifficulty[level]) || 0; value.pong.lossesByDifficulty[level] = Number(pong.lossesByDifficulty && pong.lossesByDifficulty[level]) || 0; }); ['matchesStarted', 'matchesCompleted', 'matchesWon', 'matchesLost', 'playerPoints', 'cpuPoints', 'currentWinStreak', 'bestWinStreak', 'playTimeSeconds'].forEach(key => value.pong[key] = Math.max(0, Number(value.pong[key]) || 0)); return value; } catch (_) { return base(); } }
  function save(value) { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {} return value; }
  function change(callback) { const value = read(); callback(value.pong); save(value); window.dispatchEvent(new CustomEvent('webarcade:statschange')); return value.pong; }
  const Stats = window.WebArcadeStats = {
    key: KEY, get: () => read(), reset: () => { try { localStorage.removeItem(KEY); } catch (_) {} window.dispatchEvent(new CustomEvent('webarcade:statschange')); },
    pongStart: () => change(p => { p.matchesStarted++; p.lastPlayed = new Date().toISOString(); }),
    pongPoint: player => change(p => { if (player) p.playerPoints++; else p.cpuPoints++; p.lastPlayed = new Date().toISOString(); }),
    pongComplete: result => change(p => { const level = ['easy', 'normal', 'hard'].includes(result.difficulty) ? result.difficulty : 'normal'; p.matchesCompleted++; p.playTimeSeconds += Math.max(0, Math.round(Number(result.playTimeSeconds) || 0)); p.lastPlayed = new Date().toISOString(); if (result.won) { p.matchesWon++; p.winsByDifficulty[level]++; p.currentWinStreak++; p.bestWinStreak = Math.max(p.bestWinStreak, p.currentWinStreak); } else { p.matchesLost++; p.lossesByDifficulty[level]++; p.currentWinStreak = 0; } })
  };
}());
