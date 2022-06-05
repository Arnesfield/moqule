import { moqule, register } from '.';
import { defineProperties } from './utils';

// access via `moqule.register()`
defineProperties<any>(moqule, { register });

export default moqule;
