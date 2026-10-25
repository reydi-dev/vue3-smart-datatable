import type { DataProviderRequest, FilterState } from '../types/index.js'

function isPlain(value: object): boolean {
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/** Query values can contain arrays/dates; opaque business objects retain identity. */
export function equalQueryValue(
  left: unknown,
  right: unknown,
  seen = new WeakMap<object, WeakSet<object>>(),
): boolean {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false
  if (left instanceof Date || right instanceof Date)
    return (
      left instanceof Date &&
      right instanceof Date &&
      Object.is(left.getTime(), right.getTime())
    )
  if (Array.isArray(left) !== Array.isArray(right)) return false
  if (!Array.isArray(left) && (!isPlain(left) || !isPlain(right))) return false
  if (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length !== right.length
  )
    return false
  const compared = seen.get(left)
  if (compared?.has(right)) return true
  if (compared) compared.add(right)
  else seen.set(left, new WeakSet([right]))
  const keys = Object.keys(left)
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) =>
        Object.hasOwn(right, key) &&
        equalQueryValue(Reflect.get(left, key), Reflect.get(right, key), seen),
    )
  )
}

function copyValue(
  value: unknown,
  seen = new WeakMap<object, object>(),
): unknown {
  if (!value || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value.getTime())
  if (!Array.isArray(value) && !isPlain(value)) return value
  if (seen.has(value)) return seen.get(value)
  if (Array.isArray(value)) {
    const result: unknown[] = []
    seen.set(value, result)
    for (const item of value) result.push(copyValue(item, seen))
    return result
  }
  const result: Record<string, unknown> = {}
  seen.set(value, result)
  for (const key of Object.keys(value))
    Object.defineProperty(result, key, {
      value: copyValue(Reflect.get(value, key), seen),
      enumerable: true,
      writable: true,
      configurable: true,
    })
  return result
}

export function snapshotFilters(filters: FilterState): FilterState {
  return Object.fromEntries(
    Object.entries(filters).map(([key, clause]) => [
      key,
      {
        ...clause,
        ...(Object.hasOwn(clause, 'value')
          ? { value: copyValue(clause.value) }
          : {}),
        ...(Object.hasOwn(clause, 'from')
          ? { from: copyValue(clause.from) }
          : {}),
        ...(Object.hasOwn(clause, 'to') ? { to: copyValue(clause.to) } : {}),
      },
    ]),
  )
}

/** Copy containers without changing identity-based select filter values. */
export function copyFilters(filters: FilterState): FilterState {
  return Object.fromEntries(
    Object.entries(filters).map(([key, clause]) => [
      key,
      {
        ...clause,
        ...(Array.isArray(clause.value) ? { value: [...clause.value] } : {}),
      },
    ]),
  )
}

export function copyRequest(request: DataProviderRequest): DataProviderRequest {
  return {
    ...request,
    sort: request.sort ? { ...request.sort } : null,
    filters: copyFilters(request.filters),
  }
}
