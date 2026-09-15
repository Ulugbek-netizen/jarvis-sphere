import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
try {
  await page.addInitScript(() => {
    window.voiceStarts=0;
    window.SpeechRecognition=class {
      start(){window.rec=this; window.voiceStarts++;}
      stop(){queueMicrotask(()=>this.onend?.());}
    };
  });
  await page.goto('http://127.0.0.1:4317/?test=sphere3');
  await page.locator('#particle-sphere').waitFor();
  await page.waitForFunction(()=>document.querySelector('#particle-sphere').width>100);
  assert.equal(await page.locator('.reactor-center').isVisible(),false);
  assert.equal(await page.locator('.chat-panel').isVisible(),false);
  await page.screenshot({path:'.runtime/sphere-desktop.png'});
  await page.getByRole('button',{name:'Start voice control',exact:true}).click();
  await page.waitForFunction(()=>window.voiceStarts===1);
  await page.evaluate(()=>{const result=[{transcript:'Jarvis wake up'}];result.isFinal=true;window.rec.onresult({resultIndex:0,results:[result]});});
  assert.equal(await page.locator('#core-state').textContent(),'AWAKE');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#voice').textContent(),'Start voice control');
  await page.getByRole('button',{name:'Conversation',exact:true}).click();
  assert.equal(await page.locator('.chat-panel').isVisible(),true);
  await page.locator('#prompt').fill('Reply with exactly JARVIS_SPHERE_OK');
  await page.locator('#send').click();
  await page.getByText('JARVIS_SPHERE_OK',{exact:true}).waitFor({timeout:95000});
  await page.getByRole('button',{name:'Conversation',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'.runtime/sphere-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: visible particle sphere with reduced motion, hidden old orb, drawers, simulated wake phrase, Escape, real Hermes response, mobile layout.');
} finally {await browser.close();}
