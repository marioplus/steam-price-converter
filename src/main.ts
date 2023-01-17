import {main} from './RealMain'
import {CountyCode2County} from './County'

(async () => {
    // 目标国家代码，可在此处替换
    const countyCode = 'CN'
    const county = CountyCode2County.get(countyCode)
    if (county == undefined) {
        throw Error('获取转换后的国家信息失败，国家代码：' + countyCode)
    }
    await main(county)
})()
