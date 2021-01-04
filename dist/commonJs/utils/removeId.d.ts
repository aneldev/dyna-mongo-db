export declare const removeId: <TData>(data: TData) => Pick<TData, Exclude<keyof TData, "id">>;
