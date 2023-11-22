import 'reflect-metadata'

const metadataKey = 'Metadata:JsonProperty'

type JsonProperty = {
    alias?: string,
    typeAs?: Function
    mapValue?: boolean
}

export function JsonProperty(config: JsonProperty = {}) {
    return (target: Object, property: string): void => {
        config.alias = config.alias || property
        Reflect.defineMetadata(metadataKey, config, target, property)
    }
}

export function JsonAlias(alias?: string) {
    return (target: Object, property: string): void => {
        const config = Reflect.getMetadata(metadataKey, target, property) || {}
        config.alias = alias || property
        Reflect.defineMetadata(metadataKey, config, target, property)
    }
}


export class Serializable<T extends Serializable<T>> {

    toJson(): any {
        const anyThis: any = <any>this
        const json: any = {}
        Object.keys(this).forEach(propKey => {
            const config = Reflect.getMetadata(metadataKey, this, propKey)
            const prop = anyThis[propKey]
            if (!config || prop === undefined) {
                return
            }

            if (config.typeAs || config.typeAs === Map) {
                json[config.alias] = {};
                (<Map<any, any>>prop).forEach((v, k) => {
                    json[config.alias][k] = v
                })
                return
            }
            if (prop instanceof Serializable) {
                json[config.alias] = prop.toJson()
                return
            }
            json[config.alias] = prop
        })
        return json
    }

    toJsonString(): string {
        return JSON.stringify(this.toJson())
    }

    readJson(json: any): this {
        const anyThis: any = <any>this
        Object.keys(this).forEach(propKey => {
            const config = Reflect.getMetadata(metadataKey, this, propKey)
            if (!config) {
                return
            }
            const prop = anyThis[propKey]
            const jsonNode = json[config.alias]
            if (jsonNode === undefined) {
                return
            }
            // 仅仅处理的两成map嵌套
            if (config.typeAs || config.typeAs === Map) {
                let entries = Object.entries(jsonNode)
                if (config.mapValue) {
                    entries = entries.map(([k, v]) => {
                        if (v instanceof Object) {
                            return [k, new Map(Object.entries(v))]
                        }
                        return [k, v]
                    })
                }
                anyThis[propKey] = new Map(entries)
                return
            }

            if (prop instanceof Serializable) {
                prop.readJson(jsonNode)
                return
            }
            anyThis[propKey] = jsonNode
        })
        return this
    }

    readJsonString(jsonString: string): this {
        return this.readJson(JSON.parse(jsonString))
    }
}
