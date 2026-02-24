export type ClassConstructor<T> = new () => T

export class Jsons {
    /**
     * 将对象转换为普通 JSON 对象，递归处理 Map
     */
    public static toJson(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        if (obj instanceof Map) {
            const json: Record<string, any> = {}
            for (const [key, value] of obj) {
                json[key] = this.toJson(value)
            }
            return json
        }

        if (Array.isArray(obj)) {
            return obj.map(v => this.toJson(v))
        }

        const json: Record<string, any> = {}
        const keys = Object.keys(obj)
        for (const key of keys) {
            json[key] = this.toJson((obj as any)[key])
        }
        return json
    }

    /**
     * 将对象转换为 JSON 字符串
     */
    public static toString(obj: any): string {
        return JSON.stringify(this.toJson(obj))
    }

    /**
     * 将普通 JSON 对象解析为指定类型，支持嵌套处理，包括 Map 和 Record 中的 class
     */
    public static readJson<T extends object>(json: Record<any, any>, cls?: ClassConstructor<T>): T {
        if (!cls) {
            // 如果没有提供构造器，直接返回 JSON 数据（适用于简单的对象类型）
            if (typeof json !== 'object' || json === null) {
                throw new Error('Invalid JSON input')
            }
            return json as T
        }

        // 创建目标类的实例
        const instance = new cls()

        // 直接处理 Map 类型
        if (instance instanceof Map) {
            return this.handleMap(json, instance) as T
        }

        for (const key of Reflect.ownKeys(json) as (keyof T)[]) {
            const value = json[key]

            if (value === null || value === undefined) {
                // 跳过空值
                (instance as any)[key] = value
                continue
            }

            const fieldValue = (instance as any)[key]

            if (fieldValue !== null && typeof fieldValue === 'object' && !(fieldValue instanceof Array)) {
                if (fieldValue instanceof Map) {
                    // 处理 Map 类型
                    (instance as any)[key] = this.handleMap(value, fieldValue)
                } else if (fieldValue instanceof Object) {
                    // 处理普通对象
                    (instance as any)[key] = this.readJson(value, fieldValue.constructor as any)
                }
            } else if (Array.isArray(fieldValue)) {
                // 如果是数组，递归处理数组中的对象
                (instance as any)[key] = value.map((item: any) =>
                    typeof item === 'object' ? this.readJson(item, fieldValue[0]?.constructor as any) : item
                )
            } else {
                // 普通字段直接赋值
                (instance as any)[key] = value
            }
        }

        return instance
    }

    /**
     * 处理 Map 类型的转换，其中 V 可以是一个 class
     */
    private static handleMap<K extends string, V extends object>(
        value: Record<string, any>,
        mapInstance: Map<K, V>
    ): Map<K, V> {
        const map = new Map<K, V>()
        if (value && typeof value === 'object') {
            for (const key of Object.keys(value) as K[]) {
                const mapValue = value[key]
                if (mapValue === null || mapValue === undefined) {
                    map.set(key, mapValue)
                    continue
                }

                const existingValue = mapInstance.get(key)
                if (this.isObject(mapValue)) {
                    // 如果能找到原有实例，使用原有实例的构造器进行反序列化
                    if (existingValue) {
                        map.set(key, (this as any).readJson(mapValue, existingValue.constructor as any) as V)
                    } else {
                        // 否则尝试作为普通对象处理
                        map.set(key, mapValue as V)
                    }
                } else {
                    map.set(key, mapValue)
                }
            }
        }
        return map
    }

    private static isObject(value: any): value is object {
        return value !== null && typeof value === 'object'
    }

    /**
     * 将 JSON 字符串解析为指定类型，支持嵌套处理，包括 Map 和 Record 中的 class
     */
    public static readString<T extends object>(jsonString: string, cls?: new () => T): T {
        const json = JSON.parse(jsonString)
        return this.readJson(json, cls)

    }

}
