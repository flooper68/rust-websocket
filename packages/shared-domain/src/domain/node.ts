import { NodeLocked, NodeUnlocked } from '../events/events'
import { Node } from './domain-types'

type ActionContext = {
  clientUuid: string
  correlationUuid: string
}

export type ClientUuid = string

export type SelectedNode<T extends Node, C extends ClientUuid> = T & {
  selectedBy: C
}

export function buildIsNodeSelected<C extends string>(clientUuid: C) {
  return function <T extends Node>(node: T): node is SelectedNode<T, C> {
    return node.selectedBy === clientUuid
  }
}

export type ActiveNode<T extends Node> = T & {
  deleted: false
}

export function isNodeActive<T extends Node>(node: T): node is ActiveNode<T> {
  return !node.deleted
}

export type LockedNode<T extends Node> = T & {
  locked: true
}

export function isNodeLocked<T extends Node>(node: T): node is LockedNode<T> {
  return node.locked
}

export type UnlockedNode<T extends Node> = T & {
  locked: false
}

export function isNodeUnlocked<T extends Node>(
  node: T
): node is UnlockedNode<T> {
  return node.locked
}

export type UnchangedNode<T extends Node, C extends ClientUuid> = T & {
  lastEditor: C
}

export type UndoViableNode<T extends Node, C extends ClientUuid> = SelectedNode<
  T,
  C
> &
  UnchangedNode<T, C>

type ActiveSelectedNode<T extends Node, C extends ClientUuid> = SelectedNode<
  T,
  C
> &
  ActiveNode<T>

type ActiveSelectedLockedNode<
  T extends Node,
  C extends ClientUuid
> = ActiveSelectedNode<T, C> & LockedNode<T>

type ActiveSelectedUnlockedNode<
  T extends Node,
  C extends ClientUuid
> = ActiveSelectedNode<T, C> & UnlockedNode<T>

export interface ActiveNodeActions {
  lock<T extends Node, C extends ClientUuid>(
    node: ActiveSelectedUnlockedNode<T, C>,
    context: ActionContext
  ): NodeLocked
  unlock<T extends Node, C extends ClientUuid>(
    node: ActiveSelectedLockedNode<T, C>,
    context: ActionContext
  ): NodeUnlocked
}

export type ClientSelection<C extends ClientUuid> = SelectedNode<Node, C>[]

export type ActiveSelection<C extends ClientUuid> = ActiveSelectedNode<
  Node,
  C
>[]

export type ActiveLockedSelection<C extends ClientUuid> =
  ActiveSelectedLockedNode<Node, C>[]

export type ActiveUnlockedSelection<C extends ClientUuid> =
  ActiveSelectedUnlockedNode<Node, C>[]

export interface SelectionActions {
  unlock<C extends ClientUuid>(
    selection: ActiveLockedSelection<C>,
    context: ActionContext
  ): NodeUnlocked[]
  lock<C extends ClientUuid>(
    selection: ActiveUnlockedSelection<C>,
    context: ActionContext
  ): NodeLocked[]
}

type UnchangedPreviousSelection = {
  nodes: Node[]
}

export interface UndoableActions {
  undo(selection: UnchangedPreviousSelection): void
  redo(selection: UnchangedPreviousSelection): void
}
