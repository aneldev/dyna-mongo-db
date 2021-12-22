import {dynaError} from "dyna-error";
import {DynaMongoDB} from "../../../src";
import {ICollectionsUpgrades} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";
import {hideConsoleError} from "../../utils/hideConsoleError";

const TEST_COLLECTION_NAME = 'test-48823-create-a-collection';
let willFail = true;

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
        version: 20,
        title: 'Add the first doc',
        method: async ({
          db, collectionName,
        }) => {
          if (willFail) throw dynaError({message: 'Test error'});
          const collection = await db.collection<any>(collectionName);
          await collection.insertOne({
            code: 1,
            info: 'My 1st doc',
          });
        },
      },
      {
        version: 30,
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
  const errors: any[] = [];

  const clearDb = async (): Promise<void> => {
    await dmdb.dropCollection(TEST_COLLECTION_NAME);
  };

  beforeAll(async () => {
    hideConsoleError(true);
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeCollections: collectionUpgrades,
      onUpgradeError: (collectionName, version, error) => errors.push({
        collectionName,
        version,
        error,
      }),
    });
    await dmdb.connect();
    await clearDb();
  });

  afterAll(async () => {
    hideConsoleError(false);
    await clearDb();
    await dmdb.disconnect();
  });

  describe('Create Collection', () => {
    it('Test collection should not exist', async () => {
      const exists = await dmdb.collectionExists(TEST_COLLECTION_NAME);
      expect(exists).toBe(false);
    });

    it('should fail trying to findFirst', async () => {
      expect.assertions(3);
      try {
        await dmdb.findFirst<any>({
          collectionName: TEST_COLLECTION_NAME,
          filter: {code: 2},
        });
      }
      catch (e) {
        expect(e.message).toBe('Test error');
        expect(errors).toMatchSnapshot();
        const collectionVersion = await dmdb.getCollectionVersion(TEST_COLLECTION_NAME);
        expect(collectionVersion).toBe(10);
      }
    });

    it('should fail again trying to findFirst', async () => {
      expect.assertions(3);
      try {
        await dmdb.findFirst<any>({
          collectionName: TEST_COLLECTION_NAME,
          filter: {code: 2},
        });
      }
      catch (e) {
        expect(e.message).toBe('Test error');
        expect(errors).toMatchSnapshot();
        const collectionVersion = await dmdb.getCollectionVersion(TEST_COLLECTION_NAME);
        expect(collectionVersion).toBe(10);
      }
    });

    it('Fix the error and try findFirst again', async () => {
      willFail = false;
      const doc = await dmdb.findFirst<any>({
        collectionName: TEST_COLLECTION_NAME,
        filter: {code: 2},
      });
      expect(doc).not.toBe(null);
      expect(doc.code).toBe(2);
      const collectionVersion = await dmdb.getCollectionVersion(TEST_COLLECTION_NAME);
      expect(collectionVersion).toBe(30);
    });

  });

});
