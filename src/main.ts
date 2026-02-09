import { createApp } from 'vue'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './style.css'
import App from './App.vue'

// vue-ganttastic 需要这些 dayjs 插件
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

createApp(App).mount('#app')
