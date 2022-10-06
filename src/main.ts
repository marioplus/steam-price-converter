import {main} from './RealMain'
import {counties, County} from './County'

(async () => {
    // @ts-ignore
    const cn: County = counties.get('CN')
    await main(cn)
})()
