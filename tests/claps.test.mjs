import test from 'node:test';
import assert from 'node:assert/strict';
import { ClapDetector } from '../public/claps.js';
test('two isolated transients activate; sustained sound and single clap do not', () => {
  const detector = new ClapDetector();
  assert.equal(detector.sample(.7, 100), false);
  assert.equal(detector.sample(.01, 140), false);
  assert.equal(detector.sample(.8, 430), false);
  assert.equal(detector.sample(.01, 470), true);
  const loud = new ClapDetector();
  for(let t=0;t<900;t+=20) assert.equal(loud.sample(.8,t),false);
  assert.equal(loud.sample(.01,920),false);
});
