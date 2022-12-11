import { expect } from 'chai';
import { ModuleRef } from '../../types/moduleRef.types';

export function expectModuleRef(moduleRef: ModuleRef): void {
  expect(moduleRef).to.be.an('object');
  expect(moduleRef.name).to.be.a('string');
  expect(moduleRef.get).to.be.a('function');
  expect(moduleRef.getOptional).to.be.a('function');
  expect(moduleRef.onInit).to.be.a('function');
}
