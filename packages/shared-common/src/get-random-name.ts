export function getRandomFunnyName(): string {
  const firstNames = [
    'Dweezil',
    'Fifi',
    'Engelbert',
    'Benedict',
    'Euphemia',
    'Frodo',
    'Griselda',
    'Humphrey',
    'Ignatius',
    'Jocasta'
  ]

  const lastNames = [
    'Wobblebottom',
    'Snickerdoodle',
    'Dingleberry',
    'Whifflebottom',
    'Bumbershoot',
    'Fiddlesticks',
    'Gigglesnort',
    'Zigglewurst',
    'Noodlewhisker',
    'Fluffernutter'
  ]

  const randomFirstNameIndex = Math.floor(Math.random() * firstNames.length)
  const randomLastNameIndex = Math.floor(Math.random() * lastNames.length)

  return `${firstNames[randomFirstNameIndex]} ${lastNames[randomLastNameIndex]}`
}
