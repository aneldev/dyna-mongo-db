import "jest";
import {DynaMongoDB} from "../../../src";
import {ICollectionsUpgrades} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

jest.setTimeout(10000);

const TEST_COLLECTION_NAME = 'test-775723-wait-the-upgrades';

const collectionUpgrades: ICollectionsUpgrades = {
  [TEST_COLLECTION_NAME]: {
    upgrades: [
      {
        version: 10,
        title: 'Creation of the collection',
        method: async ({
          collectionName, db,
        }) => {
          await db.createCollection(collectionName);
        },
      },
      {
        version: 12,
        title: 'Create the unique index',
        method: async ({
          db, collectionName,
        }) => {
          const collection = await db.collection<any>(collectionName);
          await collection.createIndex(
            {email: 1},
            {
              unique: true,
              name: 'index-email-unique',
            },
          );
          await new Promise(r => setTimeout(r, 3000));
        },
      },
    ],
  },
};

interface IUser {
  email: string;
  name: string;
}

describe('Upgrade Collections', () => {
  const dmdb = new DynaMongoDB({
    connectionString: testConnectionInfo.connectionString,
    databaseName: testConnectionInfo.databaseName,
    upgradeCollections: collectionUpgrades,
  });

  const clearDb = async (): Promise<void> => {
    await dmdb.dropCollection(TEST_COLLECTION_NAME);
  };

  beforeAll(async (done) => {
    await clearDb();
    done();
  });
  afterAll(async (done) => {
    await clearDb();
    await dmdb.disconnect();
    done();
  });

  test('Await to Upgrade Collections and then use it', done => {
    (async () => {
      const collection = await dmdb.getCollection<IUser>(TEST_COLLECTION_NAME);

      await collection.insertOne({
        name: 'John Smith',
        email: 'j.smith@example.com',
      });
      await collection.insertOne({
        name: 'Nancy Lorens',
        email: 'n.lorens@example.com',
      });

      try {
        await collection.insertOne({
          name: 'John Smith',
          email: 'j.smith@example.com',
        });
        fail('Should not insert duplicated emails');
      }
      catch (e) {
        expect(e).not.toBe(undefined);
      }

      const users = await collection.find().toArray();
      expect(users.length).toBe(2);

      done();
    })();
  });

});
