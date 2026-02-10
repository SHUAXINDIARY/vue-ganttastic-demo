// 甘特图条形数据类型
export interface GanttBar {
    beginDate: string
    endDate: string
    ganttBarConfig: {
        id: string
        label?: string
        immobile?: boolean
        style?: Record<string, string>
    }
}

// 甘特图行数据类型
export interface GanttRowData {
    label: string
    bars: GanttBar[]
}

// 甘特图 Bar 配置（用于展示详情）
export interface GanttBarConfig {
    id?: string
    label?: string
    style?: Record<string, string>
}