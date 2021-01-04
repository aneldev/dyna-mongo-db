export const removeId = <TData, >(data: TData): Omit<TData, "id"> => {
  const data_: any = {...data};
  delete data_._id;
  return data_;
};
