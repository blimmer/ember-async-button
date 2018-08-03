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

    assert.dom('#custom-disabled button').isDisabled();
    assert.contains('#custom-disabled button', 'Save');
    await fillIn('#custom-disabled input', 'x');
    assert.dom('#custom-disabled button').isNotDisabled();
    assert.contains('#custom-disabled button', 'Save');

    await click('#custom-disabled button');
    assert.contains('#custom-disabled button', 'Saving...');
    assert.dom('#custom-disabled button').isDisabled();
    run(() => set(DisabledController, 'promise', resolve()));
    assert.contains('#custom-disabled button', 'Save');
    assert.dom('#custom-disabled button').isNotDisabled();
    await fillIn('#custom-disabled input', '');
    assert.contains('#custom-disabled button', 'Save');
    assert.dom('#custom-disabled button').isDisabled();
  });
});
