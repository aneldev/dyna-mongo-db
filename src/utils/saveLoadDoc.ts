import {ObjectId} from "mongodb";

export const saveDoc = <TData, >(item: TData): any => {
  const item_: any = {...item};
  if (item_.id !== undefined) {
    if (item_.id) item_._id = new ObjectId(item_.id);
    delete item_.id;
  }
  return item_;
};

export const loadDoc = <TData, >(item: TData): TData => {
  const item_: any = {...item};
  item_.id = item_._id.toHexString();
  delete item_._id;
  return item_;
};
