import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('.runtime', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, permissions: ['camera'], reducedMotion: 'reduce' });
const page = await context.newPage(); const errors = [], checks = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && m.text() !== 'INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text()); });
try {
  await page.goto('http://127.0.0.1:4317');
  await page.locator('#chat-status').getByText('Hermes bridge ready · provider checked on send').waitFor(); checks.push('Server session and telemetry loaded');
  await page.screenshot({ path: '.runtime/desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Conversation', exact: true }).click();
  await page.getByRole('button', { name: 'Clear the noise' }).click(); assert.match(await page.locator('#prompt').inputValue(), /focused/); checks.push('Suggestion fills composer');
  if (process.env.JARVIS_LIVE_TEST === '1') {
    await page.locator('#prompt').fill('Reply with exactly JARVIS_BROWSER_OK'); await page.getByRole('button', { name: 'Send message' }).click();
    await page.getByText('JARVIS_BROWSER_OK', { exact: true }).waitFor({ timeout: 95000 }); checks.push('Real Hermes response through browser HTTP flow');
  }
  await page.getByRole('button', { name: 'Clear thread', exact: true }).click(); assert.equal(await page.locator('.message').count(), 1); checks.push('Conversation clear');
  await page.route('**/api/chat', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: '<img src=x onerror="window.compromised=true">' }) }));
  await page.locator('#prompt').fill('Browser-only rendering test'); await page.getByRole('button', { name: 'Send message' }).click();
  await page.locator('.message.assistant p').filter({ hasText: '<img src=x' }).waitFor();
  assert.equal(await page.locator('.messages img').count(), 0); assert.equal(await page.evaluate(() => window.compromised), undefined);
  await page.unroute('**/api/chat'); await page.getByRole('button', { name: 'Clear thread', exact: true }).click(); checks.push('Injected HTML displayed as text using a stubbed model response');
  await page.locator('#notes').fill('JARVIS browser verification'); await page.reload(); assert.equal(await page.locator('#notes').inputValue(), 'JARVIS browser verification'); await page.locator('#notes').fill(''); checks.push('Notes persist after reload');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click(); await page.getByRole('button', { name: 'Pause', exact: true }).waitFor(); await page.getByRole('button', { name: 'Pause', exact: true }).click(); await page.getByRole('button', { name: 'Resume', exact: true }).waitFor(); await page.getByRole('button', { name: 'Reset', exact: true }).click(); checks.push('Timer starts, pauses, resumes control and resets');
  await page.getByRole('button', { name: 'Help', exact: true }).click(); assert.equal(await page.locator('#help-dialog').isVisible(), true); await page.getByRole('button', { name: 'Got it' }).click(); checks.push('Help dialog');
  await page.getByRole('button', { name: /Enable air touch/ }).click();
  await page.getByRole('button', { name: 'Disable air touch', exact: true }).waitFor({ timeout: 35000 });
  await page.getByRole('button', { name: 'Arm desktop control', exact: true }).click(); await page.getByRole('button', { name: 'Disarm desktop control', exact: true }).waitFor(); checks.push('Desktop control requires explicit arming after camera startup');
  await page.waitForFunction(() => ['FINDING HAND', 'TRACKING'].includes(document.getElementById('gesture-state').textContent), { timeout: 15000 });
  checks.push('Real MediaPipe worker initialized and processed synthetic webcam frames');
  await page.locator('#camera').evaluate(el => { window.testTrack = el.srcObject.getTracks()[0]; });
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#gesture-state').textContent(), 'OFFLINE'); assert.equal(await page.getByRole('button', { name: 'Arm desktop control', exact: true }).getAttribute('aria-pressed'), 'false'); assert.equal(await page.locator('#camera').evaluate(el => el.srcObject), null); assert.equal(await page.evaluate(() => window.testTrack.readyState), 'ended'); checks.push('Escape releases camera, disarms desktop control, and ends media track');
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied for test', 'NotAllowedError'); }; });
  await page.getByRole('button', { name: /Enable air touch/ }).click(); await page.getByText('Camera permission denied. Enable permission in your browser to use air touch.').waitFor(); checks.push('Camera denial gives actionable feedback (permission response simulated)');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); await page.screenshot({ path: '.runtime/mobile.png', fullPage: true }); checks.push('390px responsive layout without horizontal overflow');
  assert.deepEqual(errors, []); checks.push('No application errors; known TensorFlow INFO diagnostic excluded');
  await writeFile('.runtime/browser-results.json', JSON.stringify({ checks, errors }, null, 2)); console.log(JSON.stringify({ checks, errors }, null, 2));
} catch (e) { await page.screenshot({ path: '.runtime/failure.png', fullPage: true }); console.error(JSON.stringify({ checks, errors, failure: e.message }, null, 2)); process.exitCode = 1; }
finally { await browser.close(); }
