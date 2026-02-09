import { ref } from 'vue'
import type { GanttBar } from '../types'

const today = new Date()
const dateStr = today.toISOString().split('T')[0]

// 扩展颜色列表，确保每行有足够的不重复颜色
const colors = [
    // 绿色系
    '#42b883', '#27ae60', '#2ecc71', '#1abc9c', '#16a085',
    // 蓝色系
    '#3498db', '#2980b9', '#5dade2', '#1e90ff', '#6495ed',
    // 红色系
    '#e74c3c', '#c0392b', '#ff6b6b', '#ee5a52', '#cd5c5c',
    // 紫色系
    '#9b59b6', '#8e44ad', '#a569bd', '#bb8fce', '#7d3c98',
    // 橙黄色系
    '#f39c12', '#e67e22', '#d35400', '#f1c40f', '#f4d03f',
    // 青色系
    '#00bcd4', '#00acc1', '#26c6da', '#4dd0e1', '#80deea',
    // 粉色系
    '#e91e63', '#ec407a', '#f48fb1', '#ff80ab', '#ff4081',
    // 灰蓝色系
    '#607d8b', '#78909c', '#546e7a', '#455a64', '#90a4ae'
]

const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

const randomTime = () => {
    const hour = randomInt(10, 18)
    const minute = randomInt(0, 1) ? '00' : '30'
    return `${String(hour).padStart(2, '0')}:${minute}`
}

// Fisher-Yates 洗牌算法，返回打乱后的数组副本
function shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    return result
}

// 生成配置接口
export interface GenerateConfig {
    rowCount: number      // 分镜数量
    minBars: number       // 每个分镜最少任务数
    maxBars: number       // 每个分镜最多任务数
}

// 默认配置
export const defaultConfig: GenerateConfig = {
    rowCount: 100,
    minBars: 1,
    maxBars: 20
}

// 生成甘特图数据的函数
export function generateRows(config: GenerateConfig = defaultConfig): { label: string; bars: GanttBar[] }[] {
    const { rowCount, minBars, maxBars } = config
    const actualMinBars = Math.min(minBars, maxBars)
    const actualMaxBars = Math.max(minBars, maxBars)

    return Array.from({ length: rowCount }, (_, rowIndex) => {
        const barCount = randomInt(actualMinBars, actualMaxBars)
        
        // 为每行打乱颜色顺序，确保同一行内颜色不重复
        const shuffledColors = shuffle(colors)

        const bars: GanttBar[] = Array.from({ length: barCount }, (_, barIndex) => {
            const start = randomTime()
            const endHour = Math.min(
                parseInt(start.slice(0, 2)) + randomInt(1, 2),
                19
            )
            const end = `${String(endHour).padStart(2, '0')}:${start.slice(3)}`

            // 使用索引取色，确保同一行不重复
            const color = shuffledColors[barIndex % shuffledColors.length] ?? '#42b883'
            return {
                beginDate: `${dateStr} ${start}`,
                endDate: `${dateStr} ${end}`,
                ganttBarConfig: {
                    id: `row-${rowIndex}-bar-${barIndex}`,
                    label: `任务 ${barIndex + 1}`,
                    immobile: true,
                    style: {
                        background: color
                    }
                }
            }
        })

        return {
            label: `分镜 ${rowIndex + 1}`,
            bars
        }
    })
}

// 初始化数据
export const rows = ref<{ label: string; bars: GanttBar[] }[]>(generateRows())
