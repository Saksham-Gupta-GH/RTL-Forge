import { SignalValue } from '../domain/types';

export function evalAnd(a: SignalValue, b: SignalValue): SignalValue {
  if (a === 0 || b === 0) return 0;
  if (a === 1 && b === 1) return 1;
  return 'X';
}

export function evalOr(a: SignalValue, b: SignalValue): SignalValue {
  if (a === 1 || b === 1) return 1;
  if (a === 0 && b === 0) return 0;
  return 'X';
}

export function evalNot(a: SignalValue): SignalValue {
  if (a === 1) return 0;
  if (a === 0) return 1;
  return 'X';
}

export function evalXor(a: SignalValue, b: SignalValue): SignalValue {
  if (a === 0 && b === 0) return 0;
  if (a === 1 && b === 1) return 0;
  if (a === 1 && b === 0) return 1;
  if (a === 0 && b === 1) return 1;
  return 'X';
}

export function evalNand(a: SignalValue, b: SignalValue): SignalValue {
  return evalNot(evalAnd(a, b));
}

export function evalNor(a: SignalValue, b: SignalValue): SignalValue {
  return evalNot(evalOr(a, b));
}

export function evalXnor(a: SignalValue, b: SignalValue): SignalValue {
  return evalNot(evalXor(a, b));
}

export function evalBuffer(a: SignalValue): SignalValue {
  if (a === 1) return 1;
  if (a === 0) return 0;
  if (a === 'Z') return 'Z';
  return 'X';
}
