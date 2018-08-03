import { click, fillIn, visit } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let DisabledController;

module('Acceptance | Disabled AsyncButton', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    DisabledController = this.owner.lookup('controller:disabled');
  });

  hooks.afterEach(function() {
    DisabledController = null;
  });

  test('button works with custom disabled conditional', async function(assert) {
    await visit('/disabled');

    assert.dom('#custom-disabled button').isDisabled();
    assert.dom('#custom-disabled button').hasText('Save');
    await fillIn('#custom-disabled input', 'x');
    assert.dom('#custom-disabled button').isNotDisabled();
    assert.dom('#custom-disabled button').hasText('Save');

    await click('#custom-disabled button');
    assert.dom('#custom-disabled button').hasText('Saving...');
    assert.dom('#custom-disabled button').isDisabled();
    run(() => set(DisabledController, 'promise', resolve()));
    assert.dom('#custom-disabled button').hasText('Save');
    assert.dom('#custom-disabled button').isNotDisabled();
    await fillIn('#custom-disabled input', '');
    assert.dom('#custom-disabled button').hasText('Save');
    assert.dom('#custom-disabled button').isDisabled();
  });
});
