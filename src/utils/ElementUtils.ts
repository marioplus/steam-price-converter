export function addCdnCss(urls: string[]) {
    urls.forEach(url => {
        const linkEl = document.createElement('link')
        linkEl.href = url
        linkEl.type = 'text/css'
        linkEl.rel = 'stylesheet'
        document.head.append(linkEl)
    })
}

export function addCdnScript(urls: string[], type?: 'module' | 'text/javascript') {
    urls.forEach(url => {
        const scriptEl = document.createElement('script')
        scriptEl.src = url
        if (type) {
            scriptEl.type = type
        }
        document.body.append(scriptEl)
    })
}
