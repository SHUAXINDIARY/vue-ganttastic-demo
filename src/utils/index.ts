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

// 剧本名称列表
const scriptNames = [
    '星河漫游', '深海迷踪', '风起长安', '暗夜追踪', '云端之上',
    '逆光飞翔', '破晓之城', '流浪地球', '幻梦奇缘', '烽火连城',
    '雪域苍穹', '碧海潮生', '月下花影', '铁血丹心', '九州缥缈',
]

// 生成甘特图数据的函数
export function generateRows(config: GenerateConfig = defaultConfig): { label: string; bars: GanttBar[] }[] {
    const { rowCount, minBars, maxBars } = config
    const actualMinBars = Math.min(minBars, maxBars)
    const actualMaxBars = Math.max(minBars, maxBars)

    // 随机选一个剧本名和起始集数
    const scriptName = scriptNames[randomInt(0, scriptNames.length - 1)]!
    const startEpisode = randomInt(1, 20)

    return Array.from({ length: rowCount }, (_, rowIndex) => {
        const barCount = randomInt(actualMinBars, actualMaxBars)
        
        // 为每行打乱颜色顺序，确保同一行内颜色不重复
        const shuffledColors = shuffle(colors)

        // 每行最多允许 2 个 2 小时的长任务
        const MAX_LONG_TASKS = 2
        let longTaskCount = 0

        const bars: GanttBar[] = Array.from({ length: barCount }, (_, barIndex) => {
            const start = randomTime()
            const startHour = parseInt(start.slice(0, 2))

            // 决定任务时长（小时）：1 或 2，但 2 小时任务受数量限制
            let durationHours: number
            if (longTaskCount < MAX_LONG_TASKS && randomInt(0, 3) === 0) {
                // 约 25% 概率生成 2 小时长任务（受上限约束）
                durationHours = 2
                longTaskCount++
            } else {
                durationHours = 1
            }

            const endHour = Math.min(startHour + durationHours, 19)
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
            label: `${scriptName}第${startEpisode}集 分镜${rowIndex + 1}`,
            bars
        }
    })
}

// 初始化数据
export const rows = ref<{ label: string; bars: GanttBar[] }[]>(generateRows())
