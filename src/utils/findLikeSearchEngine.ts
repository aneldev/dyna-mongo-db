export const findLikeSearchEngine = (fieldName: string, searchText?: string) => {
  if (!searchText || !searchText.trim()) return {};
  const searchParts = searchText.split(' ').filter(Boolean);
  return {
    $and: searchParts
      .map(searchPart => {
        const isNot = searchPart[0] === '-';
        const text = isNot ? searchPart.substr(1) : searchPart;
        const comparison = {
          $regex: `.*${text}.*`,
          $options: 'i',
        };
        return isNot ?
          {[fieldName]: {$not: comparison}}
          : {[fieldName]: comparison};
      }),
  };
};
