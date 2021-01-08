import {findLikeSearchEngine} from "../../../src";

describe('findLikeSearchEngine', ()=>{
  test('Search a word', ()=>{
    expect(findLikeSearchEngine('searchContent', 'Hello')).toMatchSnapshot();
  });
  test('Search a sentence', ()=>{
    expect(findLikeSearchEngine('searchContent', 'Hello World')).toMatchSnapshot();
  });
  test('Search a sentence excluding words', ()=>{
    expect(findLikeSearchEngine('searchContent', 'Hello World -Japan - Holland')).toMatchSnapshot();
  });
});
