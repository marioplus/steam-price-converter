import {main} from './realMain'

// 打包报错想出来的 不能再main.ts 中出现 await
main().then()
