const title = `steam-price-convertor ${new Date().getMilliseconds()}`

export function format(format: string, ...args: any[]): string {
    args = args || []
    let message = format
    for (let arg of args) {
        message = message.replace('%s', arg)
    }
    return title + message
}

const Color = {
    log: '#009688',
    info: '#2196f3',
    warn: '#ffc107',
    error: '#e91e63'
}

function hintStyle(color: string): string {
    return `
        background: ${color};
        color: white;
        padding: 1px 3px;
        border-radius: 2px;
    `
}

type Level = {
    index: number
    color: string
    name: string
    bindSource: Function
}

const Levels = {
    log: <Level>{
        index: 0,
        color: '#009688',
        name: 'log',
        bindSource: console.log
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

const Config = {
    level: Levels.info
}

// @ts-ignore
function empLog() {
}

function unBind(level: Level) {
    if (level.index < Config.level.index) {
        // @ts-ignore
        Logs[level.name] = empLog.bind(this)
    }
}

export const Logs = {
    log: console.log.bind(console, `%c${title}`, hintStyle(Color.log)),
    info: console.info.bind(console, `%c${title}`, hintStyle(Color.info)),
    warn: console.warn.bind(console, `%c${title}`, hintStyle(Color.warn)),
    error: console.error.bind(console, `%c${title}`, hintStyle(Color.error)),
}

unBind(Levels.log)
unBind(Levels.info)
unBind(Levels.warn)
unBind(Levels.error)
