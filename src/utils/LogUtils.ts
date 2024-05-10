const title = initTitle()

function initTitle(): string {
    // if (window.frameElement && window.frameElement.tagName === 'IFRAME') {
    //     return `steam-price-convertor iframe(${new Date().getMilliseconds()})`
    // } else {
    //     return 'steam-price-convertor'
    // }

    if (window.parent != window || window.frames.length > 0) {
        return `steam-price-convertor iframe(${new Date().getMilliseconds()})`
    } else {
        return 'steam-price-convertor'
    }
}

function hintStyle(color: string): string {
    return `
        background: ${color};
        color: white;
        padding: 1px 3px;
        border-radius: 2px;
    `
}

function hintContent() {
    return `%c${title}`
}

type Level = {
    index: number
    color: string
    name: string
    bindSource: Function
}

// 日志等级定义
export const LogLevels = {
    debug: <Level>{
        index: 0,
        color: '#009688',
        name: 'debug',
        bindSource: console.debug
    },
    info: <Level>{
        index: 1,
        color: '#2196f3',
        name: 'info',
        bindSource: console.info
    },
    warn: <Level>{
        index: 2,
        color: '#ffc107',
        name: 'warn',
        bindSource: console.warn
    },
    error: <Level>{
        index: 3,
        color: '#e91e63',
        name: 'error',
        bindSource: console.error
    },
    off: <Level>{
        index: 4,
        color: '',
        name: 'off',
        bindSource: empLog
    }
}

const LogConfig = {
    level: LogLevels.info
}

/**
 * 日志级别不足时，使用这个空方法替代绑定
 */
function empLog() {
}

function unBind(level: Level) {
    if (level.index < LogConfig.level.index) {
        // @ts-ignore
        Logger[level.name] = empLog.bind(this)
    }
}

export const Logger = {
    debug: console.log.bind(console, hintContent(), hintStyle(LogLevels.debug.color)),
    info: console.info.bind(console, hintContent(), hintStyle(LogLevels.info.color)),
    warn: console.warn.bind(console, hintContent(), hintStyle(LogLevels.warn.color)),
    error: console.error.bind(console, hintContent(), hintStyle(LogLevels.error.color)),
}

unBind(LogLevels.debug)
unBind(LogLevels.info)
unBind(LogLevels.warn)
unBind(LogLevels.error)
