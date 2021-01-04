export const removeId = <TData, >(data: TData): Omit<TData, "id"> => {
  const data_: any = {...data};
  delete data_.id;
  return data_;
};
