/**
 * Tests voor dom.js — DOM utility functions.
 * Functions (qs, qsa, createElement, delegate) are loaded as globals via
 * <script> in test-runner.html.
 */

describe('dom — qs()', () => {
  it('finds an element by selector', () => {
    const el = qs('body');
    assert.isElement(el);
    assert.equal(el.tagName, 'BODY');
  });

  it('returns null for non-existent selector', () => {
    const el = qs('#does-not-exist-xyz');
    assert.equal(el, null);
  });
});

describe('dom — qsa()', () => {
  it('returns a real array', () => {
    const result = qsa('div');
    assert.ok(Array.isArray(result), 'qsa should return an Array');
  });

  it('returns array even for no matches', () => {
    const result = qsa('.nonexistent-class-xyz');
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 0);
  });
});

describe('dom — createElement()', () => {
  it('creates an element with the specified tag', () => {
    const el = createElement('p');
    assert.isElement(el);
    assert.equal(el.tagName, 'P');
  });

  it('sets attributes', () => {
    const el = createElement('a', { href: '#test', id: 'link1' });
    assert.equal(el.getAttribute('href'), '#test');
    assert.equal(el.id, 'link1');
  });

  it('sets className via className attribute', () => {
    const el = createElement('div', { className: 'card card--large' });
    assert.equal(el.className, 'card card--large');
  });

  it('appends text children', () => {
    const el = createElement('span', {}, 'Hello');
    assert.equal(el.textContent, 'Hello');
  });

  it('appends element children', () => {
    const child = createElement('em', {}, 'World');
    const parent = createElement('p', {}, child);
    assert.equal(parent.children.length, 1);
    assert.equal(parent.children[0].tagName, 'EM');
  });
});

describe('dom — delegate()', () => {
  it('delegates click events to matching children', async () => {
    const parent = createElement('div');
    const child = createElement('button', { className: 'btn' }, 'Click');
    parent.appendChild(child);
    document.body.appendChild(parent);

    let called = false;
    delegate(parent, 'click', '.btn', () => { called = true; });
    child.click();

    assert.ok(called, 'delegate handler should have been called');
    parent.remove();
  });

  it('does NOT trigger for non-matching children', () => {
    const parent = createElement('div');
    const child = createElement('span', { className: 'other' }, 'Nope');
    parent.appendChild(child);
    document.body.appendChild(parent);

    let called = false;
    delegate(parent, 'click', '.btn', () => { called = true; });
    child.click();

    assert.ok(!called, 'delegate should not trigger for non-matching selector');
    parent.remove();
  });
});
