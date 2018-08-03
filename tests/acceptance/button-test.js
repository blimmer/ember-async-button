import { click, find, visit, waitUntil } from '@ember/test-helpers';
import { resolve, reject, Promise } from 'rsvp';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let AppController;

module('Acceptance | AsyncButton', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    AppController = this.owner.lookup('controller:application');
  });

  hooks.afterEach(function() {
    AppController = null;
  });

  test('button resolves', async function(assert) {
    await visit('/');

    assert.dom('#first-button').hasText('Save');
    let promise = click('#first-button');
    await waitUntil(() => find('#first-button').textContent.indexOf('Saving...') > -1)
    assert.dom('#first-button').hasText('Saving...');
    await promise;
    assert.dom('#first-button').hasText('Saved!');
  });

  test('button bound to controller promise resolves', async function(assert) {
    await visit('/');

    assert.dom('#promise-bound button.async-button').hasText('Save');
    run(() => set(AppController, 'promise', resolve()));
    await waitUntil(() => find('#promise-bound button.async-button').textContent.indexOf('Saved!') > -1)
    assert.dom('#promise-bound button.async-button').hasText('Saved!');
  });

  test('parameters passed to the helper are passed to the action', async function(assert) {
    await visit('/');

    assert.equal(AppController.get('actionArgument1'), undefined);
    assert.equal(AppController.get('actionArgument2'), undefined);
    assert.equal(AppController.get('actionArgument3'), undefined);

    await click('button.arg-button');
    assert.equal(AppController.get('actionArgument1'), 'argument 1');
    assert.equal(AppController.get('actionArgument2'), 'argument 2');
    assert.equal(AppController.get('actionArgument3'), 'argument 3');
  });

  test('dynamic parameters passed to the helper are passed to the action', async function(assert) {
    await visit('/');

    assert.equal(AppController.get('actionArgument3'), undefined);

    await click('button.arg-button');

    assert.equal(AppController.get('actionArgument3'), 'argument 3');

    run(() => set(AppController, 'dynamicArgument', 'changed argument'));
    await click('button.arg-button');

    assert.equal(AppController.get('actionArgument3'), 'changed argument');
  });

  test('button bound to controller promise fails', async function(assert) {
    await visit('/');

    assert.dom('#promise-bound button.async-button').hasText('Save');
    run(() => set(AppController, 'promise', reject()));
    await waitUntil(() => find('#promise-bound button.async-button').textContent.indexOf('Fail!') > -1)
    assert.dom('#promise-bound button.async-button').hasText('Fail!');
  });

  test('app should not crash due to a race condition on resolve', async function(assert) {
    let resolve;
    let promise = new Promise(function(r) {
      resolve = r;
    });
    run(() => set(AppController, 'shown', true));
    await visit('/');

    run(() => set(AppController, 'promise', promise));
    run(() => set(AppController, 'shown', false));
    resolve();
    assert.ok(true, 'App should not crash due to a race condition on resolve');
  });

  test('app should not crash due to a race condition on reject', async function(assert) {
    let reject;
    let promise = new Promise(function(resolve, r) {
      reject = r;
    });
    run(() => set(AppController, 'shown', true));
    await visit('/');

    run(() => set(AppController, 'promise', promise));
    run(() => set(AppController, 'shown', false));
    reject();
    assert.ok(true, 'App should not crash due to a race condition on reject');
  });

  test('button fails', async function(assert) {
    await visit('/');

    assert.dom('button.async-button').hasText('Save');
    await click('.rejectPromise');
    click('button.async-button');
    await waitUntil(() => find('button.async-button').textContent.indexOf('Saving...') > -1);
    assert.dom('button.async-button').hasText('Saving...');
    await waitUntil(() => find('button.async-button').textContent.indexOf('Fail!') > -1);
    assert.dom('button.async-button').hasText('Fail!');
  });

  test('button type is set', async function(assert) {
    await visit('/');

    assert.dom('#set-type button.async-button[type="submit"]').exists({ count: 1 });
    assert.dom('#set-type button.async-button[type="button"]').exists({ count: 1 });
    assert.dom('#set-type button.async-button[type="reset"]').exists({ count: 1 });
  });

  test('button reset', async function(assert) {
    await visit('/');
    await click('button.async-button');

    assert.dom('button.async-button').hasText('Saved!');
    await click('.dirtyState');
    assert.dom('button.async-button').hasText('Save');
    await click('.dirtyState');
    await click('button.async-button');
    assert.dom('button.async-button').hasText('Saved!');
  });

  test('Can render a template instead', async function(assert) {
    await visit('/');

    assert.dom('button.template').hasText('This is the template content.');
  });

  test('tabindex is respected', async function(assert) {
    await visit('/');

    assert.equal(find('#tabindex button').getAttribute('tabindex'), 4);
  });

  test('Block form yields correctly', async function(assert) {
    let buttonSelector = '#accepts-block button';
    await visit('/');

    assert.dom(buttonSelector).hasText('Save');
    await click(buttonSelector);
    assert.dom(buttonSelector).hasText('Saved!');
  });

  test('Yield state', async function(assert) {
    await visit('/');

    assert.dom('#state-yield button.async-button').hasText('default');
    await click('#state-yield button.async-button');
    assert.dom('#state-yield button.async-button').hasText('pending');
    run(()=> set(AppController, 'promise', reject()));
    await waitUntil(() => find('#state-yield button.async-button').textContent.indexOf('rejected') > -1);
    assert.dom('#state-yield button.async-button').hasText('rejected');
    run(()=> set(AppController, 'promise', resolve()));
    await waitUntil(() => find('#state-yield button.async-button').textContent.indexOf('fulfilled') > -1);
    assert.dom('#state-yield button.async-button').hasText('fulfilled');
  });
});
