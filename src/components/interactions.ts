/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
/** Read native form state without assuming DOM globals exist during module loading. */
export function inputChecked(event: Event): boolean {
  return Boolean(
    event.target && 'checked' in event.target && event.target.checked,
  )
}

/** Interactive content in a cell/slot owns its click; it must not also activate the row. */
export function isInteractiveTarget(event: Event): boolean {
  const target = event.target
  return Boolean(
    target &&
    'closest' in target &&
    typeof target.closest === 'function' &&
    target.closest(
      'button, a, input, select, textarea, summary, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"])',
    ),
  )
}
