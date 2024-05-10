import {ClassConstructor, instanceToPlain, plainToInstance} from 'class-transformer'

export class JsonUtils {

    public static toJson(obj: any): Record<string, any> {
        return instanceToPlain(obj)
    }

    public static toJsonString(obj: any): string {
        return JSON.stringify(this.toJson(obj))
    }

    public static readJson<T>(json: any, cls: ClassConstructor<T>): T {
        return plainToInstance(cls, json)
    }

    public static readJsonString<T>(jsonString: string, cls: ClassConstructor<T>): T {
        return this.readJson(JSON.parse(jsonString), cls)
    }
}
