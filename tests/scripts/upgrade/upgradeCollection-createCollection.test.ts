import {DynaMongoDB} from "../../../src";
import {ICollectionsUpgrades} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

const TEST_COLLECTION_NAME = 'test-48823-create-a-collection';

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
        title: 'Add the first doc',
        method: async ({
          db, collectionName,
        }) => {
          const collection = await db.collection<any>(collectionName);
          await collection.insertOne({
            code: 1,
            info: 'My 1st doc',
          });
        },
      },
      {
        version: 20,
        title: 'Add the second doc',
        method: async ({
          db, collectionName,
        }) => {
          const collection = await db.collection<any>(collectionName);
          await collection.insertOne({
            code: 2,
            info: 'My 2nd doc',
          });
        },
      },
    ],
  },
};

describe('Upgrade Collections', () => {
  let dmdb: DynaMongoDB;

  const clearDb = async (): Promise<void> => {
    const exist = await dmdb.collectionExists(TEST_COLLECTION_NAME);
    if (!exist) return;
    await dmdb.dropCollection(TEST_COLLECTION_NAME);
  };

  beforeAll(async () => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeCollections: collectionUpgrades,
    });
    await dmdb.connect();
    await clearDb();
  });
  afterAll(async () => {
    // Await new Promise(r => setTimeout(r, 100));
    await clearDb();
    await dmdb.disconnect();
  });

  describe('Create Collection', () => {
    it('Test collection should not exist', async () => {
      const exists = await dmdb.collectionExists(TEST_COLLECTION_NAME);
      expect(exists).toBe(false);
    });

    it('should create new collection and fetch the default doc with code 2', async () => {
      const doc = await dmdb.findFirst<any>({
        collectionName: TEST_COLLECTION_NAME,
        filter: {code: 2},
      });

      expect(doc).not.toBe(null);
      expect(doc.code).toBe(2);
    });

  });

});
