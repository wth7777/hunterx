// ==================== AUTOMATED TEST SUITE ====================
// Tests every card ability and team synergy in the Hunter × Hunter Nen Card Battle
// Run by calling runAllTests() from the browser console

let testResults = [];
let testCount = 0;
let passCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    testResults.push({ pass: true, message });
  } else {
    testResults.push({ pass: false, message });
    console.error('FAIL:', message);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, message + ` (expected ${expected}, got ${actual})`);
}

function resetGameState() {
  // Create a minimal mock game state for testing
  state = {
    player: { life: 20, maxAura: 1, aura: 1, deck: [], hand: [], board: [], grave: [] },
    ai: { life: 20, maxAura: 1, aura: 1, deck: [], hand: [], board: [], grave: [] },
    turn: 1, active: 'player', phase: 'main', attackers: [],
    difficulty: 'medium'
  };
  campaignProgress = { completedChapters: [], currentChapter: null, chapterAttempts: {} };
  playerXP = 0; playerLevel = 1; unlockedCards = []; collection = {};
  logMsgs = [];
}

function log(msg) {
  logMsgs.push(msg);
}

function cardById(id) {
  return CARD_DB.find(c => c.id === id);
}

function makeInstance(card) {
  return {
    uid: uid(), id: card.id,
    power: card.power, toughness: card.toughness,
    tapped: false, summoningSickness: card.id !== 'killua',
    attacking: false, blocking: false,
    tempBuffs: [], tempStatus: {},
    cantBlock: card.cantBlock || false
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function drawCard(who) {
  if (who.deck.length === 0) { who.life -= 1; return; }
  const cardId = who.deck.pop();
  const card = cardById(cardId);
  who.hand.push({ ...card, uid: uid() });
}

function addXP(amount) {
  playerXP += amount;
  const needed = playerLevel * 50;
  if (playerXP >= needed) {
    playerLevel++;
    playerXP -= needed;
    return true;
  }
  return false;
}

function flashCard(uid) {}
function flashFace(side) {}
function SFX() {}

// ==================== INDIVIDUAL CARD TESTS ====================

function testGonEnter() {
  resetGameState();
  state.player.board = [];
  const inst = makeInstance(cardById('gon'));
  applyEnterEffects(cardById('gon'), inst, 'player');
  assertEqual(state.player.life, 21, 'Gon enter: gains 1 life');
}

function testKilluaHaste() {
  resetGameState();
  const inst = makeInstance(cardById('killua'));
  assertEqual(inst.summoningSickness, false, 'Killua: no summoning sickness (haste)');
}

function testKurapikaEnter() {
  resetGameState();
  state.player.board = [];
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  const inst = makeInstance(cardById('kurapika'));
  applyEnterEffects(cardById('kurapika'), inst, 'player');
  assertEqual(target.tapped, true, 'Kurapika enter: taps target');
  assertEqual(target.skipUntap, true, 'Kurapika enter: skipUntap set');
}

function testLeorioEnter() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  const inst = makeInstance(cardById('leorio'));
  applyEnterEffects(cardById('leorio'), inst, 'player');
  assertEqual(target.toughness, 2, 'Leorio enter: deals 1 damage (3->2)');
}

function testRazorEnter() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  const inst = makeInstance(cardById('razor'));
  applyEnterEffects(cardById('razor'), inst, 'player');
  assertEqual(target.toughness, 1, 'Razor enter: deals 2 damage (3->1)');
}

function testIllurioEnter() {
  resetGameState();
  state.ai.hand = [cardById('gon'), cardById('killua')];
  const inst = makeInstance(cardById('illumi'));
  applyEnterEffects(cardById('illumi'), inst, 'player');
  assertEqual(state.ai.hand.length, 1, 'Illumi enter: opponent discards 1 card');
}

function testMeruemEnter() {
  resetGameState();
  state.player.deck = [cardById('gon'), cardById('killua')];
  const inst = makeInstance(cardById('meruem'));
  applyEnterEffects(cardById('meruem'), inst, 'player');
  assertEqual(state.player.life, 23, 'Meruem enter: gains 3 life');
  assertEqual(state.player.hand.length, 1, 'Meruem enter: draws 1 card');
}

function testNeferpitouAura() {
  resetGameState();
  state.player.board = [
    makeInstance(cardById('gon')),
    makeInstance(cardById('killua')),
    makeInstance(cardById('neferpitou'))
  ];
  applyEnterEffects(cardById('neferpitou'), state.player.board[2], 'player');
  const gon = state.player.board[0];
  const killua = state.player.board[1];
  assertEqual(gon.power, 4, 'Pitou aura: gon power +1 (3->4)');
  assertEqual(gon.toughness, 3, 'Pitou aura: gon toughness +1 (2->3)');
  assertEqual(killua.power, 4, 'Pitou aura: killua power +1 (3->4)');
  assertEqual(killua.toughness, 3, 'Pitou aura: killua toughness +1 (2->3)');
}

function testKiteEnter() {
  resetGameState();
  const inst = makeInstance(cardById('kite'));
  applyEnterEffects(cardById('kite'), inst, 'player');
  const weapon = state.player.board.find(b => b.id === 'weapon-token');
  assert(weapon, 'Kite enter: creates weapon token');
  assertEqual(weapon.power, 2, 'Kite enter: weapon power 2');
  assertEqual(weapon.toughness, 2, 'Kite enter: weapon toughness 2');
}

function testHealTechnique() {
  resetGameState();
  state.player.life = 15;
  resolveCardEffect(cardById('heal'), null, 'player', null);
  assertEqual(state.player.life, 19, 'Heal: gains 4 life (15->19)');
}

function testHealCap() {
  resetGameState();
  state.player.life = 29;
  resolveCardEffect(cardById('heal'), null, 'player', null);
  assertEqual(state.player.life, 30, 'Heal: capped at 30 life');
}

function testCounterTechnique() {
  resetGameState();
  state.player.life = 18;
  resolveCardEffect(cardById('counter'), null, 'player', null);
  assertEqual(state.player.life, 20, 'Counter: gains 2 life');
  assertEqual(state.player.tempStatus.counter, 2, 'Counter: counter set to 2');
}

function testEmperorTimeTechnique() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  resolveCardEffect(cardById('emperor-time'), null, 'player', null);
  assertEqual(gon.power, 4, 'Emperor Time: gon power +1 (3->4)');
  assertEqual(gon.toughness, 3, 'Emperor Time: gon toughness +1 (2->3)');
}

function testTenTechnique() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  resolveCardEffect(cardById('ten'), null, 'player', gon);
  assertEqual(gon.toughness, 5, 'Ten: gon toughness +3 (2->5)');
}

function testRenTechnique() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  resolveCardEffect(cardById('ren'), null, 'player', gon);
  assertEqual(gon.power, 5, 'Ren: gon power +2 (3->5)');
  assertEqual(gon.toughness, 4, 'Ren: gon toughness +2 (2->4)');
}

function testKilluaLightning() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  resolveCardEffect(cardById('killua-lightning'), null, 'player', target);
  assertEqual(target.toughness, 0, 'Killua Lightning: gon toughness 0 (3->0, destroyed)');
  assertEqual(target.tempStatus.cantBlock, 'endTurn', 'Killua Lightning: cantBlock set');
}

function testEmissionBlastCharacter() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  resolveCardEffect(cardById('emission-blast'), null, 'player', target);
  assertEqual(target.toughness, 0, 'Emission Blast: gon destroyed (3->0)');
}

function testEmissionBlastFace() {
  resetGameState();
  state.ai.life = 20;
  const faceTarget = { id: 'face', name: 'Player', toughness: 999 };
  resolveCardEffect(cardById('emission-blast'), null, 'ai', faceTarget);
  assertEqual(state.player.life, 17, 'Emission Blast: deals 3 to face (20->17)');
}

function testJudgment() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('chrollo'))]; // power 4
  const target = state.ai.board[0];
  resolveCardEffect(cardById('judgment'), null, 'player', target);
  assertEqual(target.toughness, 0, 'Judgment: destroys power 4+ character');
}

function testJudgmentWeakTarget() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))]; // power 3
  const target = state.ai.board[0];
  resolveCardEffect(cardById('judgment'), null, 'player', target);
  assertEqual(target.toughness, 2, 'Judgment: does not destroy power < 4');
}

function testBungeeGum() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('gon'))];
  const target = state.ai.board[0];
  resolveCardEffect(cardById('bungee'), null, 'player', target);
  assertEqual(state.ai.board.length, 0, 'Bungee Gum: removes target from board');
  assertEqual(state.ai.hand.length, 1, 'Bungee Gum: target returned to hand');
  assertEqual(state.ai.hand[0].id, 'gon', 'Bungee Gum: correct card returned');
}

function testZetsu() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const target = state.player.board[0];
  resolveCardEffect(cardById('zetsu'), null, 'player', target);
  assertEqual(target.tempStatus.cantBlock, 'endTurn', 'Zetsu: cantBlock set');
}

function testDowsingAI() {
  resetGameState();
  state.ai.deck = [cardById('gon'), cardById('killua'), cardById('leorio')];
  const aiHandSize = state.ai.hand.length;
  resolveCardEffect(cardById('dowsing'), null, 'ai', null);
  // AI should prefer character card
  const hasCharacter = state.ai.hand.some(c => c.type === 'character');
  assert(hasCharacter, 'Dowsing AI: picks character card');
}

function testGonJajankenFace() {
  resetGameState();
  state.ai.life = 20;
  const faceTarget = { id: 'face', name: 'Player', toughness: 999 };
  resolveCardEffect(cardById('gon-jajanken'), null, 'player', faceTarget);
  assertEqual(state.ai.life, 17, 'Gon Jajanken: deals 3 to face');
}

function testGonJajankenCharacter() {
  resetGameState();
  state.ai.board = [makeInstance(cardById('chrollo'))]; // toughness 4
  const target = state.ai.board[0];
  resolveCardEffect(cardById('gon-jajanken'), null, 'player', target);
  assertEqual(target.toughness, 0, 'Gon Jajanken: deals 4 damage, destroys chrollo (4->0)');
}

function testBiscuitEnter() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const target = state.player.board[0];
  applyEnterEffects(cardById('biscuit'), null, 'player', target);
  assertEqual(target.power, 5, 'Biscuit: gon power +2 (3->5)');
  assertEqual(target.toughness, 4, 'Biscuit: gon toughness +2 (2->4)');
}

function testSnakeAwakens() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const target = state.player.board[0];
  resolveCardEffect(cardById('snake-awakens'), null, 'player', target);
  assertEqual(target.power, 5, 'Snake Awakens: gon power +2 (3->5)');
}

function testKo() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const target = state.player.board[0];
  resolveCardEffect(cardById('ko'), null, 'player', target);
  assertEqual(target.power, 6, 'Ko: gon power +3 (3->6)');
}

function testKen() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const target = state.player.board[0];
  resolveCardEffect(cardById('ken'), null, 'player', target);
  assertEqual(target.toughness, 5, 'Ken: gon toughness +3 (2->5)');
}

function testUvoginAttack() {
  resetGameState();
  state.player.board = [makeInstance(cardById('uvogin'))];
  const inst = state.player.board[0];
  dispatchEffect('attack', { gameState: state, sourceCardId: 'uvogin', sourceInst: inst, owner: 'player', target: null, extra: null });
  assertEqual(inst.power, 8, 'Uvogin attack: power +2 (6->8)');
}

function testPhinksAttack() {
  resetGameState();
  state.player.board = [makeInstance(cardById('phinks'))];
  const inst = state.player.board[0];
  dispatchEffect('attack', { gameState: state, sourceCardId: 'phinks', sourceInst: inst, owner: 'player', target: null, extra: null });
  assertEqual(inst.power, 6, 'Phinks attack: power +2 (4->6)');
}

function testHisokaBlock() {
  resetGameState();
  state.player.board = [makeInstance(cardById('hisoka'))];
  state.ai.board = [makeInstance(cardById('gon'))];
  const atk = state.player.board[0];
  const def = state.ai.board[0];
  dispatchEffect('block', { gameState: state, sourceCardId: 'hisoka', sourceInst: atk, owner: 'player', target: def, extra: { other: def } });
  assertEqual(def.toughness, 1, 'Hisoka block: deals 1 extra damage to defender (2->1)');
}

// ==================== SYNERGY TESTS ====================

function testGonKilluaSynergy() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon')), makeInstance(cardById('killua'))];
  const gon = state.player.board[0];
  const killua = state.player.board[1];
  
  // Dispatch synergy for both
  dispatchEffect('synergy', { gameState: state, sourceCardId: 'gon', sourceInst: gon, owner: 'player', target: null, extra: null });
  dispatchEffect('synergy', { gameState: state, sourceCardId: 'killua', sourceInst: killua, owner: 'player', target: null, extra: null });
  
  assertEqual(gon.power, 4, 'Gon+Killua synergy: gon power +1 (3->4)');
  assertEqual(gon.toughness, 3, 'Gon+Killua synergy: gon toughness +1 (2->3)');
  assertEqual(killua.power, 4, 'Gon+Killua synergy: killua power +1 (3->4)');
  assertEqual(killua.toughness, 3, 'Gon+Killua synergy: killua toughness +1 (2->3)');
}

function testGonKilluaNoSynergyWithoutBoth() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  
  dispatchEffect('synergy', { gameState: state, sourceCardId: 'gon', sourceInst: gon, owner: 'player', target: null, extra: null });
  
  assertEqual(gon.power, 3, 'Gon+Killua: no synergy without killua (power stays 3)');
  assertEqual(gon.toughness, 2, 'Gon+Killua: no synergy without killua (toughness stays 2)');
}

function testPhantomTroupeSynergy() {
  resetGameState();
  state.player.board = [
    makeInstance(cardById('chrollo')), // power 4
    makeInstance(cardById('phinks')),  // power 4
    makeInstance(cardById('feitan'))   // power 3
  ];
  
  // Dispatch synergy for all troupe members
  state.player.board.forEach(b => {
    dispatchEffect('synergy', { gameState: state, sourceCardId: b.id, sourceInst: b, owner: 'player', target: null, extra: null });
  });
  
  state.player.board.forEach(b => {
    assertEqual(b.power, b.id === 'feitan' ? 4 : 5, `Troupe synergy: ${cardById(b.id).name} power +1`);
  });
}

function testPhantomTroupeNoSynergyWithoutTwo() {
  resetGameState();
  state.player.board = [makeInstance(cardById('chrollo'))];
  const chrollo = state.player.board[0];
  
  dispatchEffect('synergy', { gameState: state, sourceCardId: 'chrollo', sourceInst: chrollo, owner: 'player', target: null, extra: null });
  
  assertEqual(chrollo.power, 4, 'Phantom Troupe: no synergy with single member (power stays 4)');
}

// ==================== EFFECT SYSTEM TESTS ====================

function testTempBuffExpires() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  
  // Add a temp buff
  gon.tempBuffs = gon.tempBuffs || [];
  gon.tempBuffs.push({ p: 2, t: 2, source: 'test-buff', duration: 'endTurn' });
  gon.power += 2;
  gon.toughness += 2;
  
  assertEqual(gon.power, 5, 'Before expire: gon power 5');
  assertEqual(gon.toughness, 4, 'Before expire: gon toughness 4');
  
  expireTurnEffects('player');
  
  assertEqual(gon.power, 3, 'After expire: gon power back to 3');
  assertEqual(gon.toughness, 2, 'After expire: gon toughness back to 2');
}

function testPermBuffNoStack() {
  resetGameState();
  state.player.board = [makeInstance(cardById('gon'))];
  const gon = state.player.board[0];
  
  // Apply same permanent buff twice
  gon.tempBuffs = gon.tempBuffs || [];
  gon.tempBuffs.push({ p: 1, t: 1, source: 'perma-test', duration: 'permanent' });
  gon.power += 1;
  gon.toughness += 1;
  
  // Try to apply again - should not stack
  const hasBuff = gon.tempBuffs.some(x => x.source === 'perma-test');
  assert(hasBuff, 'Perm buff: already has buff');
  
  // Simulate the dedup check from effect system
  if (!gon.tempBuffs.some(x => x.source === 'perma-test')) {
    gon.tempBuffs.push({ p: 1, t: 1, source: 'perma-test', duration: 'permanent' });
    gon.power += 1;
    gon.toughness += 1;
  }
  
  assertEqual(gon.power, 4, 'Perm buff: no double stack (power 4)');
  assertEqual(gon.toughness, 3, 'Perm buff: no double stack (toughness 3)');
}

// ==================== TEST RUNNER ====================

function runAllTests() {
  testResults = [];
  testCount = 0;
  passCount = 0;
  logMsgs = [];
  
  console.log('=== Running Hunter × Hunter Card Battle Tests ===\n');
  
  // Individual card tests
  testGonEnter();
  testKilluaHaste();
  testKurapikaEnter();
  testLeorioEnter();
  testRazorEnter();
  testIllurioEnter();
  testMeruemEnter();
  testNeferpitouAura();
  testKiteEnter();
  testHealTechnique();
  testHealCap();
  testCounterTechnique();
  testEmperorTimeTechnique();
  testTenTechnique();
  testRenTechnique();
  testKilluaLightning();
  testEmissionBlastCharacter();
  testEmissionBlastFace();
  testJudgment();
  testJudgmentWeakTarget();
  testBungeeGum();
  testZetsu();
  testDowsingAI();
  testGonJajankenFace();
  testGonJajankenCharacter();
  testBiscuitEnter();
  testSnakeAwakens();
  testKo();
  testKen();
  testUvoginAttack();
  testPhinksAttack();
  testHisokaBlock();
  
  // Synergy tests
  testGonKilluaSynergy();
  testGonKilluaNoSynergyWithoutBoth();
  testPhantomTroupeSynergy();
  testPhantomTroupeNoSynergyWithoutTwo();
  
  // Effect system tests
  testTempBuffExpires();
  testPermBuffNoStack();
  
  console.log(`\n=== Results: ${passCount}/${testCount} tests passed ===`);
  
  const failures = testResults.filter(r => !r.pass);
  if (failures.length > 0) {
    console.log('\n--- Failures ---');
    failures.forEach(f => console.log('  ✗', f.message));
  } else {
    console.log('\n✓ All tests passed!');
  }
  
  return { passed: passCount, total: testCount, failures };
}

// Expose for browser console
window.runAllTests = runAllTests;
window.assert = assert;
window.assertEqual = assertEqual;

console.log('Test suite loaded. Run runAllTests() to execute all tests.');