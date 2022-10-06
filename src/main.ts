import {main} from './RealMain'
import {counties, County} from './County'
import log from 'loglevel'

(async () => {
    log.setLevel('INFO')
    log.setLevel('DEBUG')
    // @ts-ignore
    const cn: County = counties.get('CN')
    await main(cn)
})()
