// Dialogs for the quest board and festivals in the village.
import { G } from '../core/game.js';
import { on, emit, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { heartStr } from '../systems/npcs.js';
import { QUEST_NOTES } from '../data/quests.js';
import { canDeliver, deliver } from '../systems/quests.js';
import { PROJECTS } from '../data/projects.js';
import { funded, fundProject } from '../systems/projects.js';
import { affordable } from '../systems/upgrades.js';
import { nextFestival, contestItems, enterContest, buyStall, entry, festivalToday, hoursText, ACCEPT_TEXT, startHunt, potItems, addToPot, enterMaze, secretFriend, giveExchange, danceAsk, askDance, grangeItems, grangeKind, judgeGrange } from '../systems/festivals.js';
import { CLOTHES } from '../data/clothing.js';
import { openModal, closeModal } from './modal.js';
import { counts, unitValue } from '../systems/quality.js';
import { QUALITY } from '../data/quality.js';
import { $ } from './dom.js';

const npcName = (id) => NPCS.find((d) => d.id === id).name;
let display = [];   // v59: the grange fair's display while you arrange it

function board() {
  const S = G.S;
  const notes = S.quests.length ? S.quests.map((q) => {
    const it = ITEMS[q.item], left = q.due - S.day;
    const text = QUEST_NOTES[q.npc].replace('{n}', q.n).replace('{item}', it.name.toLowerCase());
    return `<div class="shoprow"><div><b>${text}</b><span>Pays ${q.reward}g and ${npcName(q.npc)}'s friendship. You have ${S.bag[q.item]}. ${left ? `${left + 1} days left` : 'Last day'}.</span></div>
      <div class="btns"><button data-quest="${q.id}" ${canDeliver(q) ? '' : 'disabled'}>Deliver</button></div></div>`;
  }).join('') : '<p class="role">No requests today. A new one goes up most mornings.</p>';
  const n = nextFestival();
  const fest = n ? `<h3>Calendar</h3><p>${n.inDays === 0 ? `Today: the <b>${n.f.name}</b> at the festival table, ${hoursText()}.` : `Next: the <b>${n.f.name}</b>, ${n.f.season} ${n.f.day} (in ${n.inDays} day${n.inDays === 1 ? '' : 's'}).`} ${n.f.intro}</p>` : '';
  const needs = (p) => Object.entries(p.needs).map(([k, n]) => `${n} ${ITEMS[k].name} (you have ${S.bag[k]})`).join(', ');
  const projects = `<h3>Village projects</h3>` + Object.entries(PROJECTS).map(([k, p]) => (funded(k)
    ? `<div class="shoprow"><div><b>${p.name}</b><span>Built. ${p.desc}</span></div></div>`
    : `<div class="shoprow"><div><b>${p.name}</b><span>${p.desc} ${p.cost.toLocaleString('en-US')}g<br>Needs ${needs(p)}</span></div><div class="btns"><button data-project="${k}" ${affordable(p.cost, p.needs) ? '' : 'disabled'}>Fund</button></div></div>`)).join('');
  openModal(`<h2>Quest board</h2><p class="role">Requests from your neighbours. Requests completed: ${S.questsDone || 0}. You have <b>${S.gold}g</b>.</p>${notes}${fest}${projects}`, [['Close', closeModal, true]]);
}

function festival() {
  const f = festivalToday(); if (!f) { closeModal(); return; }
  let html = `<h2>${f.name}</h2><p>${f.intro}</p>`;
  if (f.kind === 'contest') {
    const done = entry(f);
    html += `<p class="role">Prizes: ${f.ranks.map((rk) => `${rk.label} ${rk.gold}g${rk.min ? ` (worth ${rk.min}g or more)` : ''}`).join(', ')}.</p>`;
    if (done) html += `<p class="gift">You entered your ${ITEMS[done.item].name.toLowerCase()}. ${done.rank}! See you next year.</p>`;
    else {
      const best = (k) => { const c = counts(k); let t = 3; while (t > 0 && !c[t]) t--; return t; };
      const items = contestItems(f).sort((a, b) => unitValue(b, best(b)) - unitValue(a, best(a)));
      html += items.length
        ? items.map((k) => `<div class="shoprow"><div><b>${best(k) ? `${QUALITY[best(k)].name} ` : ''}${ITEMS[k].name}</b><span>Worth ${unitValue(k, best(k))}g. Your best one is entered.</span></div><div class="btns"><button data-enter="${k}">Enter</button></div></div>`).join('')
        : `<p class="role">Bring ${ACCEPT_TEXT[f.accepts]} to enter. One entry per year.</p>`;
    }
  } else if (f.kind === 'grange') {   // v59
    const done = entry(f);
    if (done) html += `<p class="gift">Your display scored ${done.score} points: ${done.rank}, ${done.gold}g. Your things are back in your bag. See you next autumn.</p>`;
    else {
      const g = f.grange, have = grangeItems();
      display = display.filter((k) => have.includes(k));
      const kinds = new Set(display.map(grangeKind)).size;
      html += `<p class="role">Prizes: ${g.ranks.map((rk) => `${rk.label} ${rk.gold}g`).join(', ')}. The judges score variety (up to ${g.kinds} kinds of thing), quality and value, and dislike empty slots. You get everything back.</p>`
        + `<h3>Your display (${display.length}/${g.slots}, ${kinds} kind${kinds === 1 ? '' : 's'})</h3>`
        + (display.length ? display.map((k) => `<div class="shoprow"><div><b>${ITEMS[k].name}</b></div><div class="btns"><button data-gout="${k}">Take back</button></div></div>`).join('') : '<p class="role">Empty. Add things from your bag below.</p>')
        + `<div class="btns"><button data-judge ${display.length ? '' : 'disabled'}>Call the judges</button></div><h3>Your bag</h3>`
        + (have.filter((k) => !display.includes(k)).map((k) => `<div class="shoprow"><div><b>${ITEMS[k].name}</b><span>${grangeKind(k)}</span></div><div class="btns"><button data-gin="${k}" ${display.length >= g.slots ? 'disabled' : ''}>Add</button></div></div>`).join('') || '<p class="role">Nothing more to show: bring crops, fruit, forage, fish, animal products, artisan goods, dishes or gems.</p>');
    }
  } else if (f.kind === 'dance') {   // v58
    const done = entry(f);
    if (done?.with) html += `<p class="gift">You danced with ${npcName(done.with)} around the ribbon pole. See you next spring.</p>`;
    else {
      const who = danceAsk(), refused = done?.refused || [];
      html += `<p class="role">Ask someone to be your partner. They say yes once they like you enough (${f.dance.hearts} hearts), and dancing together brings you closer.</p>`
        + (who.length ? who.map((id) => `<div class="shoprow"><div><b>${npcName(id)}</b><span>${refused.includes(id) ? 'Said no this year.' : `${heartStr(G.S.npcs[id])}`}</span></div><div class="btns"><button data-dance="${id}" ${refused.includes(id) ? 'disabled' : ''}>Ask</button></div></div>`).join('')
          : '<p class="role">You do not know anyone well enough to ask yet. Watch the dancers, and meet the villagers.</p>');
    }
  } else if (f.kind === 'exchange') {   // v57
    const done = entry(f), who = NPCS.find((n) => n.id === secretFriend())?.name;
    if (done) html += `<p class="gift">You gave ${NPCS.find((n) => n.id === done.to).name} your ${ITEMS[done.item].name.toLowerCase()}, and someone left you a ${ITEMS[done.got].name.toLowerCase()}. Happy Longnight.</p>`;
    else {
      const items = Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && ITEMS[k] && !ITEMS[k].material).sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
      html += `<p class="role">Your secret friend is <b>${who}</b>. Your gift counts ${f.exchange.mult} times as much as usual, so choose well.</p>`
        + (items.length ? items.map((k) => `<div class="shoprow"><div><b>${ITEMS[k].name}</b><span>You have ${G.S.bag[k]}.</span></div><div class="btns"><button data-xgift="${k}">Give</button></div></div>`).join('') : '<p class="role">Bring something to give.</p>');
    }
  } else if (f.kind === 'maze') {   // v56
    const done = entry(f);
    html += `<p class="role">The maze is open ${hoursText()}. ${done ? 'You already found this year\'s prize, but you can walk it again.' : 'Find the chest at its heart.'}</p><div class="btns"><button data-maze>Enter the maze</button></div>`;
  } else if (f.kind === 'pot') {   // v55
    const done = entry(f);
    if (done) html += `<p class="gift">You added your ${ITEMS[done.item].name.toLowerCase()}. Hob's verdict: ${done.label}. See you next year.</p>`;
    else {
      const best = (k) => { const c = counts(k); let t = 3; while (t > 0 && !c[t]) t--; return t; };
      const items = potItems().sort((a, b) => unitValue(b, best(b)) - unitValue(a, best(a)));
      html += `<p class="role">The better the ingredient, the happier everyone is with you: a magnificent soup raises every neighbour's friendship, a poor one lowers it. Your best one goes in.</p>`
        + (items.length ? items.map((k) => `<div class="shoprow"><div><b>${best(k) ? `${QUALITY[best(k)].name} ` : ''}${ITEMS[k].name}</b><span>Worth ${unitValue(k, best(k))}g.</span></div><div class="btns"><button data-pot="${k}">Add</button></div></div>`).join('') : '<p class="role">Bring something to eat: a crop, fish, forage, an animal product, an artisan good or a dish.</p>');
    }
  } else if (f.kind === 'hunt') {   // v54
    const done = entry(f);
    html += done ? `<p class="gift">You found ${done.found} eggs${done.won ? ' and won' : ''}. See you next year.</p>`
      : `<p class="role">Find ${f.hunt.need} of the ${f.hunt.eggs} eggs in ${f.hunt.seconds} seconds: walk over them to pick them up. The first win earns the ${CLOTHES[f.hunt.prize].name.toLowerCase()}, later wins ${f.hunt.gold}g.</p><div class="btns"><button data-hunt>Start the hunt</button></div>`;
  } else {
    html += `<p class="role">You have <b>${G.S.gold}g</b>.</p>` + f.stall.map((it) => `<div class="shoprow"><div><b>${it.label}</b><span>${it.desc} ${it.cost}g</span></div><div class="btns"><button data-stall="${it.key}" ${G.S.gold < it.cost || (it.once && G.S.wish[it.once]) ? 'disabled' : ''}>Buy</button></div></div>`).join('');
  }
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:board', board);
on('ui:festival', festival);

$('#mbody').addEventListener('click', (e) => {
  const q = e.target.closest('[data-quest]');
  if (q && !q.disabled) { if (deliver(q.dataset.quest)) board(); return; }
  const pj = e.target.closest('[data-project]');
  if (pj && !pj.disabled) { if (fundProject(pj.dataset.project)) board(); return; }
  const en = e.target.closest('[data-enter]');
  if (en) {
    const res = enterContest(en.dataset.enter);
    if (res) notify(`${res.rank.label}! The judges award you ${res.rank.gold}g.`);
    festival(); return;
  }
  if (e.target.closest('[data-hunt]')) { closeModal(); startHunt(); return; }   // v54
  if (e.target.closest('[data-maze]')) { closeModal(); enterMaze(); return; }   // v56
  const gin = e.target.closest('[data-gin]'), gout = e.target.closest('[data-gout]');   // v59
  if (gin && !gin.disabled) { display.push(gin.dataset.gin); festival(); return; }
  if (gout) { display = display.filter((k) => k !== gout.dataset.gout); festival(); return; }
  if (e.target.closest('[data-judge]')) {
    const r = judgeGrange(display);
    if (r) { display = []; emit('ui:message', { title: r.rank.label, text: `The judges walk along your display, whispering and making notes. ${r.score} points: ${r.rank.label.toLowerCase()}, and ${r.rank.gold}g.` }); }
    return;
  }
  const dn = e.target.closest('[data-dance]');   // v58
  if (dn && !dn.disabled) {
    const r = askDance(dn.dataset.dance);
    if (r?.yes) emit('ui:message', { title: 'The Ribbon Dance', text: `${npcName(r.id)} takes your hand. The fiddles start, and the two of you weave your ribbons around the pole with everyone else. When the music stops, ${npcName(r.id)} is still smiling.` });
    else if (r) { notify(`${npcName(r.id)} smiles, but shakes their head. "Maybe next year."`); festival(); }
    return;
  }
  const xg = e.target.closest('[data-xgift]');   // v57
  if (xg) { const r = giveExchange(xg.dataset.xgift); if (r) emit('ui:message', { title: 'Happy Longnight', text: `${r.to} unwraps your gift: ${{ loved: 'they are overjoyed', liked: 'they are delighted', neutral: 'they thank you warmly', disliked: 'they try to look pleased', hated: 'an awkward silence' }[r.tier]}. Then a small parcel finds its way to you: a ${ITEMS[r.got].name.toLowerCase()}.` }); return; }
  const pt = e.target.closest('[data-pot]');   // v55
  if (pt) { const v = addToPot(pt.dataset.pot); if (v) emit('ui:message', { title: v.label, text: `${v.text} ${v.pts > 0 ? `Everyone's friendship with you rises.` : v.pts < 0 ? `Everyone's friendship with you drops.` : ''}` }); return; }
  const st = e.target.closest('[data-stall]');
  if (st && !st.disabled) { buyStall(st.dataset.stall); festival(); }
});
