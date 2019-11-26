import { fluentProvide } from 'inversify-binding-decorators'
import { NAMES } from './names'

export function ProvideWithNamed(identifier: symbol, name: NAMES) {
  return fluentProvide(identifier)
    .whenTargetNamed(name)
    .done()
}

export function ProvideSingleton(identifier: symbol) {
  return fluentProvide(identifier)
    .inSingletonScope()
    .done()
}

export function ProvideSingletonWithNamed(identifier: symbol, name: NAMES) {
  return fluentProvide(identifier)
    .inSingletonScope()
    .whenTargetNamed(name)
    .done()
}