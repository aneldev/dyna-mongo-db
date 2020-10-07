export const removeMongoDbIds = (items: any[]): any => items.map(item => {
  delete item._id;
  return item;
});
