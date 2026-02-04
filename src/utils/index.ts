import { ref } from 'vue'
import type { GanttBar } from '../types'

const today = new Date()
const dateStr = today.toISOString().split('T')[0]

const colors = [
    '#42b883',
    '#3498db',
    '#e74c3c',
    '#9b59b6',
    '#f39c12',
    '#1abc9c',
    '#e67e22'
]

const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

const randomTime = () => {
    const hour = randomInt(10, 18)
    const minute = randomInt(0, 1) ? '00' : '30'
    return `${String(hour).padStart(2, '0')}:${minute}`
}

export const rows = ref<{ label: string; bars: GanttBar[] }[]>(
    Array.from({ length: 100 }, (_, rowIndex) => {
        const barCount = randomInt(1, 50)

        const bars: GanttBar[] = Array.from({ length: barCount }, (_, barIndex) => {
            const start = randomTime()
            const endHour = Math.min(
                parseInt(start.slice(0, 2)) + randomInt(1, 2),
                19
            )
            const end = `${String(endHour).padStart(2, '0')}:${start.slice(3)}`

            const colorIndex = randomInt(0, colors.length - 1)
            return {
                beginDate: `${dateStr} ${start}`,
                endDate: `${dateStr} ${end}`,
                ganttBarConfig: {
                    id: `row-${rowIndex}-bar-${barIndex}`,
                    label: `任务 ${barIndex + 1}`,
                    style: {
                        background: colors[colorIndex] ?? '#42b883'
                    }
                }
            }
        })

        return {
            label: `分镜 ${rowIndex + 1}`,
            bars
        }
    })
)
