/** Barva hrany výhradně z depcruise dependency objektu. */
export function edgeStroke(dep) {
  if (dep.valid !== false) return '#484f58';
  const severity = dep.rules?.[0]?.severity;
  if (severity === 'error') return '#f85149';
  if (severity === 'warn') return '#d29922';
  return '#484f58';
}
