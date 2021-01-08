import {$setData} from "../../../src/utils/$setData";

describe('$setData', () => {
  test('Plain object', () => {
    expect(
      $setData({
        name: 'John',
        phones: {
          main: '+44000011112222',
        },
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Plain object, overwrite object', () => {
    expect(
      $setData({
        name: 'John',
        phones: {
          main: '+44000011112222',
          __overwrite: true,
        },
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Plain object, root, overwrite object', () => {
    expect(
      $setData({
        name: 'John',
        phones: {
          main: '+44000011112222',
        },
        __overwrite: true,
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Root property', () => {
    expect(
      $setData({
        name: 'John',
        phones: {
          main: '+44000011112222',
        },
      }),
    )
      .toMatchSnapshot();
  });
  test('Null and undefined values', () => {
    expect(
      $setData({
        firstName: 'John',
        middleName: null,
        lastName: undefined,
        phones: {
          main: '+44000011112222',
        },
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Data with array', () => {
    expect(
      $setData({
        name: 'John',
        cars: [
          {brand: 'Volvo', modal: 2920},
          {brand: 'Saab', modal: 2017},
          null,
          undefined,
          {brand: 'Honda', modal: 2019},
        ],
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Data with array, overwrite', () => {
    expect(
      $setData({
        name: 'John',
        cars: [
          {brand: 'Volvo', modal: 2920},
          {brand: 'Saab', modal: 2017},
          null,
          undefined,
          {brand: 'Honda', modal: 2019},
          "__overwrite",
        ],
      }, 'user'),
    )
      .toMatchSnapshot();
  });
  test('Data with array, root, overwrite', () => {
    expect(
      $setData([
        {brand: 'Volvo', modal: 2920},
        {brand: 'Saab', modal: 2017},
        null,
        undefined,
        {brand: 'Honda', modal: 2019},
        "__overwrite",
      ]),
    )
      .toMatchSnapshot();
  });
  test('Data with mongoDb $concat', () => {
    expect(
      $setData({
        cars: [
          {brand: 'Volvo', modal: 2920},
          {brand: 'Saab', modal: 2017},
          {brand: 'Honda', modal: 2019, searchContent: {$concat: ["$brand", " ", "$model"]}},
        ]
      }),
    )
      .toMatchSnapshot();
  });
});
