export function startMeasurement(name = 'Measure', limit = 10) {
  const start = Date.now()

  return () => {
    const end = Date.now()
    console.log(`${name} finished. It took ${end - start}ms.`)

    if (end - start > limit) {
      console.warn(`${name} took longer than ${limit}ms - ${end - start}!`)
    }
  }
}
