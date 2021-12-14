import {DynaMongoDB} from "../../../src/DynaMongoDB";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

describe('database connection', () => {
  it('should connect with mongo db', async () => {
    const dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
    });
    const db = await dmdb.getDb();
    expect(db).not.toBe(undefined);
    dmdb.disconnect();
  });

  it('should not connect with mongo db due to wrong connection string', async () => {
    const dmdb = new DynaMongoDB({
      connectionString: 'invalid-connection-string',
      databaseName: 'hopla',
    });

    let error: any = undefined;

    await dmdb.getDb().catch(e => error = e);

    expect(error && error.message).toMatch('Invalid connection string');

    dmdb.disconnect();
  });
});
