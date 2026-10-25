/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import type { DataTableIcon, SvgIconDefinition } from '../types/index.js'

// Small, local stroke drawings: no external font, sprite, network request, or raw HTML.
const paths: Record<string, string> = {
  'arrow-up': 'M12 20V4m-6 6 6-6 6 6',
  'arrow-down': 'M12 4v16m-6-6 6 6 6-6',
  'filter-variant': 'M4 7h16M7 12h10M10 17h4',
  'view-column': 'M3 4h18v16H3zM9 4v16M15 4v16',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  'content-copy': 'M9 9h12v12H9zM15 5V3H3v12h2',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  'eye-off':
    'm3 3 18 18M9.5 5.3A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3 4M6 6.5A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5-1.2M10 10a3 3 0 0 0 4 4',
  'chevron-left': 'm15 5-7 7 7 7',
  'chevron-right': 'm9 5 7 7-7 7',
  'dots-vertical': 'M12 5h.01M12 12h.01M12 19h.01',
  refresh: 'M20 7v5h-5M4 17v-5h5M20 12A8 8 0 0 0 6 7M4 12a8 8 0 0 0 14 5',
  'check-circle': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 12l3 3 7-7',
  'close-circle': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM8 8l8 8M8 16l8-8',
}

export function resolveSvgIcon(icon: unknown): SvgIconDefinition | null {
  if (!icon || typeof icon !== 'object' || !('path' in icon)) return null
  if (
    typeof icon.path !== 'string' &&
    !(
      Array.isArray(icon.path) &&
      icon.path.every((p: unknown) => typeof p === 'string')
    )
  )
    return null
  return {
    path: icon.path,
    viewBox:
      'viewBox' in icon && typeof icon.viewBox === 'string'
        ? icon.viewBox
        : undefined,
    stroke: 'stroke' in icon && icon.stroke === true,
  }
}
const stroke = (name: string): DataTableIcon => ({
  path: paths[name],
  stroke: true,
})
export const booleanIcons = {
  yes: stroke('check-circle'),
  no: stroke('close-circle'),
}
export const defaultIcons: import('../types/index.js').DataTableIcons = {
  sortAsc: stroke('arrow-up'),
  sortDesc: stroke('arrow-down'),
  filter: stroke('filter-variant'),
  columns: stroke('view-column'),
  export: stroke('download'),
  copy: stroke('content-copy'),
  expand: stroke('eye'),
  collapse: stroke('eye-off'),
  previous: stroke('chevron-left'),
  next: stroke('chevron-right'),
  actions: stroke('dots-vertical'),
  retry: stroke('refresh'),
}
