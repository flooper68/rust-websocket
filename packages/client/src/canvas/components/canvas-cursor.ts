import { DomainSelectors, Uuid } from '@shared/domain'
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { CLIENT_UUID, getSessionState } from '../../ws/use-ws'
import { parseHexColor } from './parse-hex-color'

function getClientOrFail(uuid: string) {
  const client = DomainSelectors.getClient(uuid, getSessionState())

  if (!client) {
    throw new Error(
      `Can not render CanvasCursor, client ${uuid} does not exist!`
    )
  }

  return client
}

export function getClientCursorUuid(clientUuid: string) {
  return `cursor-${clientUuid}`
}

export function parseClientCursorUuid(uuid: string) {
  return uuid.replace('cursor-', '')
}

export class CanvasCursor {
  private constructor(
    public readonly uuid: string,
    private readonly cursor: Graphics,
    private readonly border: Graphics,
    private readonly text: Text
  ) {}

  static create(clientUuid: string, stage: Container) {
    console.log(`Creating CanvasCursor component ${clientUuid}.`)

    const client = getClientOrFail(clientUuid)
    const color = parseHexColor(client.color)

    var cursor = new Graphics()
    cursor.zIndex = 10010
    cursor.beginFill(color)
    cursor.lineTo(-50, 100)
    cursor.lineTo(0, 60)
    cursor.lineTo(50, 100)
    cursor.lineTo(0, -40)
    cursor.lineTo(-50, 100)
    cursor.endFill()
    cursor.rotation = -0.4
    cursor.width = 15
    cursor.height = 15

    const style = new TextStyle({
      fontFamily: 'Roboto',
      fontSize: 12,
      fill: 0xffffff
    })
    const text = new Text(client.name, style)
    text.zIndex = 10010

    var border = new Graphics()
    border.zIndex = 10009

    border.beginFill(color)
    border.drawRoundedRect(8, -2, text.width + 12, text.height + 8, 2)
    border.endFill()

    stage.addChild(cursor)
    stage.addChild(border)
    stage.addChild(text)

    if (clientUuid === CLIENT_UUID) {
      cursor.visible = false
      border.visible = false
      text.visible = false
    }

    const component = new CanvasCursor(
      getClientCursorUuid(clientUuid),
      cursor,
      border,
      text
    )
    component.render()

    return component
  }

  render() {
    const client = DomainSelectors.getClient(
      parseClientCursorUuid(this.uuid),
      getSessionState()
    )

    console.log(`Rendering CanvasCursor ${this.uuid}.`, client)

    if (!client) {
      this.border.visible = false
      this.cursor.visible = false
      this.text.visible = false
      return
    }

    this.cursor.position.x = client.cursor.left
    this.cursor.position.y = client.cursor.top

    this.border.position.x = client.cursor.left - 4
    this.border.position.y = client.cursor.top + 15

    this.text.position.x = client.cursor.left + 10
    this.text.position.y = client.cursor.top + 16
  }
}
