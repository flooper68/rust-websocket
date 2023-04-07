export class Branded<T> {
  // @ts-ignore
  private __brand!: T
}

export type Opaque<T, K> = T & Branded<K>

export function Opaque<T>(value: T) {
  return value as Opaque<T, never>
}
