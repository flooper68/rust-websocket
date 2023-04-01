export function parseHexColor(color: string) {
  return Number(color.replace('#', '0x'))
}
