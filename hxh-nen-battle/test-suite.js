// ==================== AUTOMATED TEST SUITE ====================
// Tests every card ability and team synergy in the Hunter × Hunter Nen Card Battle
// Run by calling hxhTests.runAllTests() from the browser console

const hxhTests = {
  results: [],
  count: 0,
  pass: 0,
  logMsgs: [],

  assert(condition, message) {
    this.count++;
    if (condition) {
      this.pass++;
      this.results.push({ pass: true, message });
    } else {
      this.results.push({ pass: false, message });
      console.error('FAIL:', message);
    }
  },

  assertEqual(actual, expected, message) {
    this.assert(actual === expected, message + ` (expected ${expected}, got ${actual})`);
  },

  // ==================== INDIVIDUAL CARD TESTS ====================

  testGonEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = makeInstance(cardById('gon'));
    applyEnterEffects(cardById('gon'), inst, 'player');
    this.assertEqual(state.player.life, 21, 'Gon enter: gains 1 life');
  },

  testKilluaHaste() {
    const inst = makeInstance(cardById('killua'));
    this.assertEqual(inst.summoningSickness, false, 'Killua: no summoning sickness (haste)');
  },

  testKurapikaEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    const inst = makeInstance(cardById('kurapika'));
    applyEnterEffects(cardById('kurapika'), inst, 'player');
    this.assertEqual(target.tapped, true, 'Kurapika enter: taps target');
    this.assertEqual(target.skipUntap, true, 'Kurapika enter: skipUntap set');
  },

  testLeorioEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    const inst = makeInstance(cardById('leorio'));
    applyEnterEffects(cardById('leorio'), inst, 'player');
    this.assertEqual(target.toughness, 2, 'Leorio enter: deals 1 damage (3->2)');
  },

  testRazorEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    const inst = makeInstance(cardById('razor'));
    applyEnterEffects(cardById('razor'), inst, 'player');
    this.assertEqual(target.toughness, 1, 'Razor enter: deals 2 damage (3->1)');
  },

  testIllumiEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [cardById('gon'), cardById('killua')], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = makeInstance(cardById('illumi'));
    applyEnterEffects(cardById('illumi'), inst, 'player');
    this.assertEqual(state.ai.hand.length, 1, 'Illumi enter: opponent discards 1 card');
  },

  testMeruemEnter() {
    state = { player: { life: 20, board: [], deck: [cardById('gon'), cardById('killua')], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = makeInstance(cardById('meruem'));
    applyEnterEffects(cardById('meruem'), inst, 'player');
    this.assertEqual(state.player.life, 23, 'Meruem enter: gains 3 life');
    this.assertEqual(state.player.hand.length, 1, 'Meruem enter: draws 1 card');
  },

  testNeferpitouAura() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon')), makeInstance(cardById('killua')), makeInstance(cardById('neferpitou'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    applyEnterEffects(cardById('neferpitou'), state.player.board[2], 'player');
    const gon = state.player.board[0];
    const killua = state.player.board[1];
    this.assertEqual(gon.power, 4, 'Pitou aura: gon power +1 (3->4)');
    this.assertEqual(gon.toughness, 3, 'Pitou aura: gon toughness +1 (2->3)');
    this.assertEqual(killua.power, 4, 'Pitou aura: killua power +1 (3->4)');
    this.assertEqual(killua.toughness, 3, 'Pitou aura: killua toughness +1 (2->3)');
  },

  testKiteEnter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = makeInstance(cardById('kite'));
    applyEnterEffects(cardById('kite'), inst, 'player');
    const weapon = state.player.board.find(b => b.id === 'weapon-token');
    this.assert(weapon, 'Kite enter: creates weapon token');
    this.assertEqual(weapon.power, 2, 'Kite enter: weapon power 2');
    this.assertEqual(weapon.toughness, 2, 'Kite enter: weapon toughness 2');
  },

  testHealTechnique() {
    state = { player: { life: 15, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    resolveCardEffect(cardById('heal'), null, 'player', null);
    this.assertEqual(state.player.life, 19, 'Heal: gains 4 life (15->19)');
  },

  testHealCap() {
    state = { player: { life: 29, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    resolveCardEffect(cardById('heal'), null, 'player', null);
    this.assertEqual(state.player.life, 30, 'Heal: capped at 30 life');
  },

  testCounterTechnique() {
    state = { player: { life: 18, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    resolveCardEffect(cardById('counter'), null, 'player', null);
    this.assertEqual(state.player.life, 20, 'Counter: gains 2 life');
    this.assertEqual(state.player.tempStatus.counter, 2, 'Counter: counter set to 2');
  },

  testEmperorTimeTechnique() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];
    resolveCardEffect(cardById('emperor-time'), null, 'player', null);
    this.assertEqual(gon.power, 4, 'Emperor Time: gon power +1 (3->4)');
    this.assertEqual(gon.toughness, 3, 'Emperor Time: gon toughness +1 (2->3)');
  },

  testTenTechnique() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];
    resolveCardEffect(cardById('ten'), null, 'player', gon);
    this.assertEqual(gon.toughness, 5, 'Ten: gon toughness +3 (2->5)');
  },

  testRenTechnique() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];
    resolveCardEffect(cardById('ren'), null, 'player', gon);
    this.assertEqual(gon.power, 5, 'Ren: gon power +2 (3->5)');
    this.assertEqual(gon.toughness, 4, 'Ren: gon toughness +2 (2->4)');
  },

  testKilluaLightning() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('killua-lightning'), null, 'player', target);
    this.assertEqual(target.toughness, 0, 'Killua Lightning: gon destroyed (3->0)');
    this.assertEqual(target.tempStatus.cantBlock, 'endTurn', 'Killua Lightning: cantBlock set');
  },

  testEmissionBlastCharacter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('emission-blast'), null, 'player', target);
    this.assertEqual(target.toughness, 0, 'Emission Blast: gon destroyed (3->0)');
  },

  testEmissionBlastFace() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const faceTarget = { id: 'face', name: 'Player', toughness: 999 };
    resolveCardEffect(cardById('emission-blast'), null, 'ai', faceTarget);
    this.assertEqual(state.player.life, 17, 'Emission Blast: deals 3 to face (20->17)');
  },

  testJudgment() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('chrollo'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('judgment'), null, 'player', target);
    this.assertEqual(target.toughness, 0, 'Judgment: destroys power 4+ character');
  },

  testJudgmentWeakTarget() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('judgment'), null, 'player', target);
    this.assertEqual(target.toughness, 2, 'Judgment: does not destroy power < 4');
  },

  testBungeeGum() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('bungee'), null, 'player', target);
    this.assertEqual(state.ai.board.length, 0, 'Bungee Gum: removes target from board');
    this.assertEqual(state.ai.hand.length, 1, 'Bungee Gum: target returned to hand');
    this.assertEqual(state.ai.hand[0].id, 'gon', 'Bungee Gum: correct card returned');
  },

  testZetsu() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.player.board[0];
    resolveCardEffect(cardById('zetsu'), null, 'player', target);
    this.assertEqual(target.tempStatus.cantBlock, 'endTurn', 'Zetsu: cantBlock set');
  },

  testDowsingAI() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [cardById('gon'), cardById('killua'), cardById('leorio')], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const aiHandSize = state.ai.hand.length;
    resolveCardEffect(cardById('dowsing'), null, 'ai', null);
    const hasCharacter = state.ai.hand.some(c => c.type === 'character');
    this.assert(hasCharacter, 'Dowsing AI: picks character card');
  },

  testGonJajankenFace() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const faceTarget = { id: 'face', name: 'Player', toughness: 999 };
    resolveCardEffect(cardById('gon-jajanken'), null, 'player', faceTarget);
    this.assertEqual(state.ai.life, 17, 'Gon Jajanken: deals 3 to face');
  },

  testGonJajankenCharacter() {
    state = { player: { life: 20, board: [], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('chrollo'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.ai.board[0];
    resolveCardEffect(cardById('gon-jajanken'), null, 'player', target);
    this.assertEqual(target.toughness, 0, 'Gon Jajanken: deals 4 damage, destroys chrollo (4->0)');
  },

  testBiscuitEnter() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.player.board[0];
    applyEnterEffects(cardById('biscuit'), null, 'player', target);
    this.assertEqual(target.power, 5, 'Biscuit: gon power +2 (3->5)');
    this.assertEqual(target.toughness, 4, 'Biscuit: gon toughness +2 (2->4)');
  },

  testSnakeAwakens() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.player.board[0];
    resolveCardEffect(cardById('snake-awakens'), null, 'player', target);
    this.assertEqual(target.power, 5, 'Snake Awakens: gon power +2 (3->5)');
  },

  testKo() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.player.board[0];
    resolveCardEffect(cardById('ko'), null, 'player', target);
    this.assertEqual(target.power, 6, 'Ko: gon power +3 (3->6)');
  },

  testKen() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const target = state.player.board[0];
    resolveCardEffect(cardById('ken'), null, 'player', target);
    this.assertEqual(target.toughness, 5, 'Ken: gon toughness +3 (2->5)');
  },

  testUvoginAttack() {
    state = { player: { life: 20, board: [makeInstance(cardById('uvogin'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = state.player.board[0];
    dispatchEffect('attack', { gameState: state, sourceCardId: 'uvogin', sourceInst: inst, owner: 'player', target: null, extra: null });
    this.assertEqual(inst.power, 8, 'Uvogin attack: power +2 (6->8)');
  },

  testPhinksAttack() {
    state = { player: { life: 20, board: [makeInstance(cardById('phinks'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const inst = state.player.board[0];
    dispatchEffect('attack', { gameState: state, sourceCardId: 'phinks', sourceInst: inst, owner: 'player', target: null, extra: null });
    this.assertEqual(inst.power, 6, 'Phinks attack: power +2 (4->6)');
  },

  testHisokaBlock() {
    state = { player: { life: 20, board: [makeInstance(cardById('hisoka'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const atk = state.player.board[0];
    const def = state.ai.board[0];
    dispatchEffect('block', { gameState: state, sourceCardId: 'hisoka', sourceInst: atk, owner: 'player', target: def, extra: { other: def } });
    this.assertEqual(def.toughness, 1, 'Hisoka block: deals 1 extra damage to defender (2->1)');
  },

  // ==================== SYNERGY TESTS ====================

  testGonKilluaSynergy() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon')), makeInstance(cardById('killua'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];
    const killua = state.player.board[1];

    dispatchEffect('synergy', { gameState: state, sourceCardId: 'gon', sourceInst: gon, owner: 'player', target: null, extra: null });
    dispatchEffect('synergy', { gameState: state, sourceCardId: 'killua', sourceInst: killua, owner: 'player', target: null, extra: null });

    this.assertEqual(gon.power, 4, 'Gon+Killua synergy: gon power +1 (3->4)');
    this.assertEqual(gon.toughness, 3, 'Gon+Killua synergy: gon toughness +1 (2->3)');
    this.assertEqual(killua.power, 4, 'Gon+Killua synergy: killua power +1 (3->4)');
    this.assertEqual(killua.toughness, 3, 'Gon+Killua synergy: killua toughness +1 (2->3)');
  },

  testGonKilluaNoSynergyWithoutBoth() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];

    dispatchEffect('synergy', { gameState: state, sourceCardId: 'gon', sourceInst: gon, owner: 'player', target: null, extra: null });

    this.assertEqual(gon.power, 3, 'Gon+Killua: no synergy without killua (power stays 3)');
    this.assertEqual(gon.toughness, 2, 'Gon+Killua: no synergy without killua (toughness stays 2)');
  },

  testPhantomTroupeSynergy() {
    state = { player: { life: 20, board: [makeInstance(cardById('chrollo')), makeInstance(cardById('phinks')), makeInstance(cardById('feitan'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };

    state.player.board.forEach(b => {
      dispatchEffect('synergy', { gameState: state, sourceCardId: b.id, sourceInst: b, owner: 'player', target: null, extra: null });
    });

    state.player.board.forEach(b => {
      this.assertEqual(b.power, b.id === 'feitan' ? 4 : 5, `Troupe synergy: ${cardById(b.id).name} power +1`);
    });
  },

  testPhantomTroupeNoSynergyWithoutTwo() {
    state = { player: { life: 20, board: [makeInstance(cardById('chrollo'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const chrollo = state.player.board[0];

    dispatchEffect('synergy', { gameState: state, sourceCardId: 'chrollo', sourceInst: chrollo, owner: 'player', target: null, extra: null });

    this.assertEqual(chrollo.power, 4, 'Phantom Troupe: no synergy with single member (power stays 4)');
  },

  // ==================== EFFECT SYSTEM TESTS ====================

  testTempBuffExpires() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];

    gon.tempBuffs = gon.tempBuffs || [];
    gon.tempBuffs.push({ p: 2, t: 2, source: 'test-buff', duration: 'endTurn' });
    gon.power += 2;
    gon.toughness += 2;

    this.assertEqual(gon.power, 5, 'Before expire: gon power 5');
    this.assertEqual(gon.toughness, 4, 'Before expire: gon toughness 4');

    expireTurnEffects('player');

    this.assertEqual(gon.power, 3, 'After expire: gon power back to 3');
    this.assertEqual(gon.toughness, 2, 'After expire: gon toughness back to 2');
  },

  testPermBuffNoStack() {
    state = { player: { life: 20, board: [makeInstance(cardById('gon'))], deck: [], hand: [], grave: [] }, ai: { life: 20, board: [], deck: [], hand: [], grave: [] }, turn: 1, active: 'player', phase: 'main', attackers: [], difficulty: 'medium' };
    const gon = state.player.board[0];

    gon.tempBuffs = gon.tempBuffs || [];
    gon.tempBuffs.push({ p: 1, t: 1, source: 'perma-test', duration: 'permanent' });
    gon.power += 1;
    gon.toughness += 1;

    const hasBuff = gon.tempBuffs.some(x => x.source === 'perma-test');
    this.assert(hasBuff, 'Perm buff: already has buff');

    if (!gon.tempBuffs.some(x => x.source === 'perma-test')) {
      gon.tempBuffs.push({ p: 1, t: 1, source: 'perma-test', duration: 'permanent' });
      gon.power += 1;
      gon.toughness += 1;
    }

    this.assertEqual(gon.power, 4, 'Perm buff: no double stack (power 4)');
    this.assertEqual(gon.toughness, 3, 'Perm buff: no double stack (toughness 3)');
  },

  // ==================== TEST RUNNER ====================

  runAllTests() {
    this.results = [];
    this.count = 0;
    this.pass = 0;
    this.logMsgs = [];

    console.log('=== Running Hunter × Hunter Card Battle Tests ===\n');

    const tests = [
      this.testGonEnter.bind(this),
      this.testKilluaHaste.bind(this),
      this.testKurapikaEnter.bind(this),
      this.testLeorioEnter.bind(this),
      this.testRazorEnter.bind(this),
      this.testIllumiEnter.bind(this),
      this.testMeruemEnter.bind(this),
      this.testNeferpitouAura.bind(this),
      this.testKiteEnter.bind(this),
      this.testHealTechnique.bind(this),
      this.testHealCap.bind(this),
      this.testCounterTechnique.bind(this),
      this.testEmperorTimeTechnique.bind(this),
      this.testTenTechnique.bind(this),
      this.testRenTechnique.bind(this),
      this.testKilluaLightning.bind(this),
      this.testEmissionBlastCharacter.bind(this),
      this.testEmissionBlastFace.bind(this),
      this.testJudgment.bind(this),
      this.testJudgmentWeakTarget.bind(this),
      this.testBungeeGum.bind(this),
      this.testZetsu.bind(this),
      this.testDowsingAI.bind(this),
      this.testGonJajankenFace.bind(this),
      this.testGonJajankenCharacter.bind(this),
      this.testBiscuitEnter.bind(this),
      this.testSnakeAwakens.bind(this),
      this.testKo.bind(this),
      this.testKen.bind(this),
      this.testUvoginAttack.bind(this),
      this.testPhinksAttack.bind(this),
      this.testHisokaBlock.bind(this),
      this.testGonKilluaSynergy.bind(this),
      this.testGonKilluaNoSynergyWithoutBoth.bind(this),
      this.testPhantomTroupeSynergy.bind(this),
      this.testPhantomTroupeNoSynergyWithoutTwo.bind(this),
      this.testTempBuffExpires.bind(this),
      this.testPermBuffNoStack.bind(this),
    ];

    tests.forEach(t => {
      try { t(); } catch(e) {
        this.count++;
        this.results.push({ pass: false, message: t.name + ' threw: ' + e.message });
        console.error('ERROR in', t.name, e);
      }
    });

    console.log(`\n=== Results: ${this.pass}/${this.count} tests passed ===`);

    const failures = this.results.filter(r => !r.pass);
    if (failures.length > 0) {
      console.log('\n--- Failures ---');
      failures.forEach(f => console.log('  ✗', f.message));
    } else {
      console.log('\n✓ All tests passed!');
    }

    return { passed: this.pass, total: this.count, failures: failures.length };
  },
};

// Expose for browser console
window.hxhTests = hxhTests;

console.log('Test suite loaded. Run hxhTests.runAllTests() to execute all tests.');