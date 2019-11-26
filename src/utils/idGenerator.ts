import * as uuid from 'uuid/v4';

export function UuidFactory(): string {
  return uuid();
}