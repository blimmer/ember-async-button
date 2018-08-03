import { click, fillIn, visit } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { click, find, fillIn, visit } from 'ember-native-dom-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let DisabledController;

module('Acceptance | Disabled AsyncButton', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    DisabledController = this.application.__container__.lookup('controller:disabled');
  });

  hooks.afterEach(function() {
    DisabledController = null;
  });

  test('button works with custom disabled conditional', async function(assert) {
    await visit('/disabled');

    assert.equal(find('#custom-disabled button').disabled, true);
    assert.contains('#custom-disabled button', 'Save');
    await fillIn('#custom-disabled input', 'x');
    assert.equal(find('#custom-disabled button').disabled, false);
    assert.contains('#custom-disabled button', 'Save');

    await click('#custom-disabled button');
    assert.contains('#custom-disabled button', 'Saving...');
    assert.equal(find('#custom-disabled button').disabled, true);
    run(() => set(DisabledController, 'promise', resolve()));
    assert.contains('#custom-disabled button', 'Save');
    assert.equal(find('#custom-disabled button').disabled, false);
    await fillIn('#custom-disabled input', '');
    assert.contains('#custom-disabled button', 'Save');
    assert.equal(find('#custom-disabled button').disabled, true);
  });
});
