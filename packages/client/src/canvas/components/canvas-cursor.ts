import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { CLIENT_UUID, WsClient } from '../../client/ws-client'
import { parseHexColor } from './parse-hex-color'

function getClientOrFail(uuid: string, wsClient: WsClient) {
  const client = wsClient.getState().session.clients[uuid]

  console.log(client)

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
    private readonly _cursor: Graphics,
    private readonly _border: Graphics,
    private readonly _text: Text,
    private readonly _client: WsClient
  ) {}

  static create(clientUuid: string, stage: Container, wsClient: WsClient) {
    console.log(`Creating CanvasCursor component ${clientUuid}.`)

    const client = getClientOrFail(clientUuid, wsClient)
    const color = parseHexColor('#FF0000')

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
    const text = new Text('client.name', style)
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
      text,
      wsClient
    )
    component.render()

    return component
  }

  render() {
    const client = getClientOrFail(
      parseClientCursorUuid(this.uuid),
      this._client
    )

    console.log(`Rendering CanvasCursor ${this.uuid}.`, client)

    if (!client) {
      this._border.visible = false
      this._cursor.visible = false
      this._text.visible = false
      return
    }

    this._cursor.position.x = client.cursor.left
    this._cursor.position.y = client.cursor.top

    this._border.position.x = client.cursor.left - 4
    this._border.position.y = client.cursor.top + 15

    this._text.position.x = client.cursor.left + 10
    this._text.position.y = client.cursor.top + 16
  }
}
