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
          {brand: 'Saab', modal: 2027},
        ],
      }, 'user'),
    )
      .toMatchSnapshot();
  });
});
