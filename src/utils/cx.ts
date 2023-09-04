// Uber-simple clsx-like className construction utility
// Credit: https://dev.to/gugaguichard/replace-clsx-classnames-or-classcat-with-your-own-little-helper-3bf

// Usage example:
// cx('base', undefined, ['more', 'classes'],
//   hasError && 'bg-red',
//   isEnabled || 'pointer-events-none',
//   isTitle ? 'font-semibold' : 'font-normal'
// )
//  Result: "base more classes bg-red font-normal"

export default function cx(...args: unknown[]) {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim();
}
