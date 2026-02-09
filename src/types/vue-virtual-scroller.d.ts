declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'

  export const RecycleScroller: DefineComponent<{
    items: unknown[]
    itemSize?: number | null
    keyField?: string
    direction?: 'vertical' | 'horizontal'
    buffer?: number
    pageMode?: boolean
    prerender?: number
    emitUpdate?: boolean
    typeField?: string
    sizeField?: string
    minItemSize?: number
    listClass?: string
    itemClass?: string
    listTag?: string
    itemTag?: string
    gridItems?: number
    itemSecondarySize?: number
    updateInterval?: number
  }>

  export const DynamicScroller: DefineComponent<{
    items: unknown[]
    minItemSize: number
    keyField?: string
    direction?: 'vertical' | 'horizontal'
    buffer?: number
    pageMode?: boolean
    prerender?: number
    emitUpdate?: boolean
    typeField?: string
    listClass?: string
    itemClass?: string
    listTag?: string
    itemTag?: string
  }>

  export const DynamicScrollerItem: DefineComponent<{
    item: unknown
    active: boolean
    sizeDependencies?: unknown[]
    watchData?: boolean
    tag?: string
    emitResize?: boolean
  }>
}
