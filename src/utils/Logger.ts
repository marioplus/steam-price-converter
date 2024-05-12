interface LogLevelDefinition {
    index: number;
    color: string;
    label: string;
    bindMethod: typeof console.info | typeof console.warn | typeof console.error;
}

function initializeLogTitle(): string {
    const isInIFrame = window.parent !== window || window.frames.length > 0
    return isInIFrame ? `steam-price-convertor iframe(${new Date().getMilliseconds()})` : 'steam-price-convertor'
}

function createLogStyle(color: string): string {
    return `
            background: ${color};
            color: white;
            padding: 1px 3px;
            border-radius: 2px;
        `
}

function composeLogHint(): string {
    return `%c${initializeLogTitle()}`
}

export type LogLabel = 'debug' | 'info' | 'warn' | 'error' | 'off'

export const LogDefinitions: Record<string, LogLevelDefinition> = {
    debug: {
        index: 0,
        color: '#009688',
        label: 'debug',
        bindMethod: console.info
    },
    info: {
        index: 1,
        color: '#2196f3',
        label: 'info',
        bindMethod: console.info
    },
    warn: {
        index: 2,
        color: '#ffc107',
        label: 'warn',
        bindMethod: console.warn
    },
    error: {
        index: 3,
        color: '#e91e63',
        label: 'error',
        bindMethod: console.error
    },
    off: {
        index: 4,
        color: '',
        label: 'off',
        bindMethod: () => {
        }
    }
}

export const Logger: Record<
    'debug' | 'info' | 'warn' | 'error',
    typeof console.debug | typeof console.info | typeof console.warn | typeof console.error
> = {
    debug: noopLog.bind(null),
    info: noopLog.bind(null),
    warn: noopLog.bind(null),
    error: noopLog.bind(null),
}

function noopLog() {
}

let currLogLevel: LogLevelDefinition = LogDefinitions.info

function refreshBinding() {
    const hint = composeLogHint()
    Object.entries(LogDefinitions).forEach(([label, def]) => {
        if (def.index >= currLogLevel.index) {
            const logStyle = createLogStyle(def.color)
            Logger[label.toLowerCase() as keyof typeof Logger] = def.bindMethod.bind(console, hint, logStyle)
        } else {
            Logger[label.toLowerCase() as keyof typeof Logger] = noopLog.bind(null)
        }
    })
}

export function setLogLevel(levelLabel: keyof typeof LogDefinitions) {
    const newLevel = LogDefinitions[levelLabel]
    if (newLevel) {
        currLogLevel = newLevel
        refreshBinding()
    } else {
        console.error(`Invalid log level: ${levelLabel}`)
    }
}

refreshBinding()
