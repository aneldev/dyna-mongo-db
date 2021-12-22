import { SetFields } from "mongodb";
export declare const $setData: <TSchema = any>(data: TSchema, propertyName?: string | undefined) => SetFields<TSchema> | Partial<TSchema>;
