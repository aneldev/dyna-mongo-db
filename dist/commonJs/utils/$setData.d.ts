import { UpdateQuery } from "mongodb";
export declare const $setData: <TSchema = any>(data: TSchema, propertyName?: string | undefined) => UpdateQuery<TSchema> | Partial<TSchema>;
