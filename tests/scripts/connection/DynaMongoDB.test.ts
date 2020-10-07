import "jest";
import {DynaMongoDB} from "../../../src/DynaMongoDB";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

describe('database connection', () => {
  it('should connect with mongo db', done => {
    const dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
    });
    dmdb.getDb()
      .then(client => {
        expect(!!client).toBe(true);
      })
      .catch(error => {
        console.log('Db connection failed');
        throw error;
      })
      .then(() => dmdb.disconnect())
      .then(() => done());
  });

  it('should not connect with mongo db due to wrong connection string', done => {
    const dmdb = new DynaMongoDB({
      connectionString: '',
      databaseName: '',
    });
    dmdb.getCollection("test-collection")
      .then(() => {
        fail('Connection was unexpected!');
      })
      .catch(error => {
        expect(!!error).toBe(true);
      })
      .then(() => dmdb.disconnect())
      .then(() => done());
  });
});


