import assert from 'assert';
import { init } from './init';

describe('init', () => {
  it('should be a function', () => {
    assert.equal(typeof init, 'function');
  });
});
