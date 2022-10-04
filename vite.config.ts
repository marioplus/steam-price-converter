import {defineConfig} from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'steam价格转换',
                author: 'marioplus',
                description: 'steam商店中的价格转换为特定的货币',
                version: '1.0.0-SNAPSHOT',
                // icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABD9JREFUeF7tm0ty2zAMQKH6Ep26C2enI2iX+Cb1SRKfpM5Jqux0BO3qRd3pIeq4A5l0GYofECAVZWzNeOKJRRJ4+BAkpQqu/KquXH+4Abh5wEQElnXzDQDu1XArANAf/Ndef07n7/AK8Pyn74bvJa9iIWAo/KCU5ejRngDaTwAvfwH2JYBkB/Clbh4rALQ2Wjj3tTkCtDlBZAOgLP5YSHETJIbFNhcIMYCvdfNwAkDF0dWnvNoKYPur71rJoCIAyt2fJAJI254AniQJkw1gWTc/3sHqPl67I8CWkxuSAXyum9UC4PuMlNdQ2iPAJhVCEgCl/E+p2xZsvz8CrFMgJAGYmdv7OCZBIAP4IMoPUFISIwnAHLJ9atgghN99t421iwJQ8zxmfMm1gXOtkFIdctrYMm4OfbcLCR4FsKwbTHopgr8ZrwJYY7GiQOLsQenrIrhw/Gg+CAKQur5WXhMhQhhZTQIhFgpBAMu6OXH93laeCMHrsgIIQS/wApBaP0Te4wle5aV5KCSLF4DE+traCRCKKa9lOQLcuQokJ4CcFR8BwsqXqaWWN8PXF5JOAFL3t/NGLBG58kxO5XVx5KoLnAAECcebM1Mg5FZeCdUe+m5tCzgCkNP9OZ5gKL8/Aexybq+58sAIQG73T4FgWX5/6Ls7ZRCsInGfUXqNkm12AHohEpLUt1xFZc125n3EIioGaHfoOyyxL9cIwLJusFxl006J9Zi0rt+Fm68kAKKtrtIANBRmoh4lQpcHiBY/pQEId6GHvBILAXb9H5pvOe5ut5GGJ/Z36Ls3Rs/uAUro4JkeTm92UWIkOa03WmuYt1XcY24SX1MBiAk6SkaO4mdfAWwyH7qQQkCUBF3zvqOYoQCIQeT8TkqComnQkOqyT+/I2O8FgDQNSgEMrmue2dkFDkJyFUOu+0wzL877illrFFcSxAFYCaf0FCgt013yjQAwV2LRzUdOwNptpABIiyE17XCKIdbZXAoYIYDRDIBjZ98QSTmVSVEe75UA8IWnEwAzDEx9hqc49FaXquAuKz187scuhIxT5xAX88GqJH5JW2KCMLCFGsJiAYC1hbnUnXoadLq/NwSk7kYwzaQAWNviGb3AxWNKAF7rBz2gsBdMBiBWmxQ/HPWEw1QAgtaPeoAKA3ZlGMgFw0NNVpmLj9mxKlDfOL7Mb94f9YDCoUDIl7xbYq6veyUBUJ4gXSTxNOG1ch6CuLoiAyg8K/DUdLeKxn1yCOgGqlqzi5qcwkv7Sl6UJXkASjdjCKN9CArNZAC60xw7tBQBifeQY97ujw1gLrMDNdsHpkoiY89tmc7sOEKwXD6rB5idCc/sUgFEn/+jdigKAdcgJV+Zkbq7uA6gUsX7MDReAe4zPOCAD0k8S98MKZYDKFA0DLy3+v9qjd4gwb+X1+ZUfy+53gmKyZc9BGIDzu33G4C5WWRqea7eA/4BFnttX6MV3HoAAAAASUVORK5CYII=',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'marioplus/steam-price-exchanger',
                match: [
                    'http*://*.steampowered.com/*',
                    'http*://*.steamcommunity.com/*'
                ],
                connect:[
                    'open.er-api.com',
                    'store.steampowered.com'
                ]
            },
        }),
    ],
})
