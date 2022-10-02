import 'reflect-metadata'
import {ExchangeRateManager} from './remote/ExchangeRateManager'
// import rate1 from './rate.json'

await ExchangeRateManager.instance.refreshRate()
    .then(res => console.log(res.rates.get('HKD')))

