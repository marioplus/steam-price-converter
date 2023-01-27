const title = '[steam-price-convertor] '

export function format(format: string, ...args: any[]): string {
    args = args || []
    let message = format
    for (let arg of args) {
        message = message.replace('%s', arg)
    }
    return title + message
}
