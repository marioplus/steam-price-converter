export type ReactInitCallback = (root: HTMLElement, reactProp: string) => Promise<void> | void;

export class ReactUtils {

    static waitForReactInit(
        callback: ReactInitCallback,
        checkInterval: number = 500,
        timeout: number = 10000
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const start = Date.now()

            const interval = setInterval(() => {
                // 从 HTML 根节点开始检查
                const root = document.documentElement
                for (const prop in root) {
                    if (prop.startsWith('__react')) {
                        clearInterval(interval)
                        console.log(`React initialized with property: ${prop}`)
                        // 如果回调是异步的，等待其完成
                        Promise.resolve(callback(root, prop))
                            .then(() => resolve())
                            .catch(reject)
                        return
                    }
                }

                if (Date.now() - start > timeout) {
                    clearInterval(interval)
                    reject(new Error('React initialization timeout exceeded.'))
                }
            }, checkInterval)
        })
    }

    static useReact() {
        return !!document.querySelector('div[data-react-nav-root]')
    }
}
