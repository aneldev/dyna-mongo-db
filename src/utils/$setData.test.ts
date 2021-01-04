import {$setData} from "./$setData";

describe('$setData', () => {
  test('Plain object', () => {
    expect(
      $setData(
        'user',
        {
          name: 'John',
          phones: {
            main: '+44000011112222',
          },
        }),
    )
      .toMatchSnapshot();
  });
  test('Data with array', () => {
    expect(
      $setData(
        'user',
        {
          name: 'John',
          cars: [
            {brand: 'Volvo', modal: 2920},
            {brand: 'Saab', modal: 2027},
          ],
        }),
    )
      .toMatchSnapshot();
  });
});
