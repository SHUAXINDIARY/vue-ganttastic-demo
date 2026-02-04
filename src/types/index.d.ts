// 甘特图条形数据类型
export interface GanttBar {
    beginDate: string
    endDate: string
    ganttBarConfig: {
        id: string
        label?: string
        style?: Record<string, string>
    }
}