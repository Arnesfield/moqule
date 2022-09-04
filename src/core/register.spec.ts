import { expect } from 'chai';
import { Module } from '../types/module.types';
import { register } from './register';

describe('register', () => {
  it('should be a function', () => {
    expect(register).to.be.a('function');
  });

  it('should return an object with module and options', () => {
    const module: Module<Record<string, any>> = { name: 'AppModule' };
    const options: Record<string, any> = {};
    const registered = register(module, options);
    expect(registered).to.be.an('object');
    expect(registered).to.have.property('module').that.equals(module);
    expect(registered).to.have.property('options').that.equals(options);
  });
});
