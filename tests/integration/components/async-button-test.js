import { Promise } from 'rsvp';
import { next } from '@ember/runloop';
import { setProperties } from '@ember/object';
import { click, find } from 'ember-native-dom-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | async button', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it responds to a fulfilled closure promise', async function(assert) {
    assert.expect(2);

    setProperties(this, {
      default: 'Save',
      pending: 'Saving',
      fulfilled: 'Saved'
    });

    this.actions.closurePromise = function() {
      return new Promise((fulfill) => {
        next(() => {
          fulfill();
        });
      });
    };

    await render(
      hbs`{{async-button default=default pending=pending fulfilled=fulfilled action=(action "closurePromise")}}`
    );
    let promise = click('button');
    assert.dom('button').hasText('Saving');
    await promise;
    assert.dom('button').hasText('Saved');
  });

  test('it responds to a rejected closure promise', async function(assert) {
    assert.expect(2);

    setProperties(this, {
      default: 'Save',
      pending: 'Saving',
      rejected: 'Retry Save'
    });

    this.actions.closurePromise = function() {
      return new Promise((fulfill, reject) => {
        next(() => {
          reject();
        });
      });
    };

    await render(
      hbs`{{async-button default=default pending=pending rejected=rejected action=(action "closurePromise")}}`
    );
    let promise = click('button');

    assert.dom('button').hasText('Saving');
    await promise;
    assert.dom('button').hasText('Retry Save');
  });

  test('closure actions can use the callback argument', async function(assert) {
    assert.expect(2);

    setProperties(this, {
      default: 'Save',
      pending: 'Saving'
    });

    this.actions.closurePromise = function(callback) {
      let promise = new Promise((fulfill) => {
        next(() => {
          fulfill();
        });
      });

      callback(promise);
    };

    await render(hbs`{{async-button default=default pending=pending action=(action "closurePromise")}}`);
    let promise = click('button');

    assert.dom('button').hasText('Saving');
    await promise;
    assert.dom('button').hasText('Save');
  });

  test('closure actions receive positional params', async function(assert) {
    assert.expect(2);

    this.actions.closurePromise = function(callback, param1, param2) {
      assert.equal(param1, 'foo');
      assert.equal(param2, 'bar');
    };

    await render(hbs`{{async-button "foo" "bar" action=(action "closurePromise")}}`);
    await click('button');
  });

  test('It can receive a tagName', async function(assert) {
    await render(hbs`{{async-button tagName="a"}}`);
    assert.dom('button').doesNotExist('There is no button');
    assert.dom('a').exists('There is anchor instead');
  });

  test('If the tagName is not an `a`, it has no `href`', async function(assert) {
    await render(hbs`{{async-button}}`);
    assert.equal(find('button').getAttribute('href'), undefined);
  });

  test('If the tagName is an `a`, it has an `href`', async function(assert) {
    await render(hbs`{{async-button tagName="a"}}`);
    assert.equal(find('a').getAttribute('href'), '');
  });

  test('The user can customize the href', async function(assert) {
    await render(hbs`{{async-button tagName="a" href="lol"}}`);
    assert.equal(find('a').getAttribute('href'), 'lol');
  });

  test('The user can opt-out to the href by passing `href=false`', async function(assert) {
    await render(hbs`{{async-button tagName="a" href=false}}`);
    assert.equal(find('a').getAttribute('href'), undefined);
  });
});
