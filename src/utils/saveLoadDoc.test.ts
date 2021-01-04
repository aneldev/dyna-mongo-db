import {loadDoc, saveDoc} from "./saveLoadDoc";
import {ObjectId} from "mongodb";

describe("save/load doc converter methods", () => {
  test('saveDoc with id', () => {
    expect(
      saveDoc({
        id: '5fe8b3a73f7b78b5488f2bed',
        name: 'Lola',
        age: 32,
      }),
    )
      .toMatchSnapshot();
  });
  test('saveDoc with empty id', () => {
    expect(
      saveDoc({
        id: '',
        name: 'Lola',
        age: 32,
      }),
    )
      .toMatchSnapshot();
  });
  test('saveDoc without id', () => {
    expect(
      saveDoc({
        name: 'Lola',
        age: 32,
      }),
    )
      .toMatchSnapshot();
  });

  test('loadDoc', () => {
    expect(
      loadDoc({
        _id: new ObjectId('5fe8b3a73f7b78b5488f2bed'),
        name: 'Lola',
        age: 32,
      }),
    )
      .toMatchSnapshot();
  });

  test('save/loadDoc', () => {
    const item = {
      id: '5fe8b3a73f7b78b5488f2bed',
      name: 'Lola',
      age: 32,
    };
    const save = saveDoc(item);
    const load = loadDoc(save);

    expect(load).toEqual(item);
  });

});

