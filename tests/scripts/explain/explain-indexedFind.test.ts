import {DynaMongoDB} from "../../../src";
import {ICollectionsUpgrades} from "../../../src";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

const USERS_COLLECTION_NAME = 'test-sector-users';
const COMPANY_USER_COLLECTION_NAME = 'test-company-74592---' + USERS_COLLECTION_NAME;

interface IUser {
  loginName: string;
  password: string;
  displayName: string;
  createdAt: number;
}

const upgradeCollections: ICollectionsUpgrades = {
  [USERS_COLLECTION_NAME]: {
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
        title: 'Index by login name',
        method: async ({
          db, collectionName,
        }) => {
          const collection = db.collection<IUser>(collectionName);
          await collection
            .createIndex(
              {loginName: 1},
              {name: 'Login name indexer'},
            );
        },
      },
      {
        version: 21,
        title: 'Index by login name and password',
        method: async ({
          db, collectionName,
        }) => {
          const collection = db.collection<IUser>(collectionName);
          await collection
            .createIndex(
              {
                loginName: 1,
                password: 1,
              },
              {name: 'Login name and password indexer'},
            );
        },
      },
    ],
  },
};

describe('Upgrade Dynamic Collections', () => {
  let dmdb: DynaMongoDB;
  beforeAll(async () => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeCollections,
    });
    const exists = await dmdb.collectionExists(COMPANY_USER_COLLECTION_NAME);
    await dmdb._debug_changeVersion(COMPANY_USER_COLLECTION_NAME, -1);
    if (exists) await dmdb.dropCollection(COMPANY_USER_COLLECTION_NAME);
  });
  afterAll(async () => {
    await dmdb.disconnect();
  });

  describe('Create dynamic collection', () => {
    it('Test collection should not exist', async () => {
      const exists = await dmdb.collectionExists(COMPANY_USER_COLLECTION_NAME);
      expect(exists).toBe(false);
    });

    it('should add some users', async () => {
      const collection = await dmdb.getCollection(COMPANY_USER_COLLECTION_NAME);
      const result = await collection.insertMany(<IUser[]>[
        {
          loginName: 'jsmith',
          password: 'yo',
          displayName: 'John Smith',
          createdAt: 300300,
        },
        {
          loginName: 'lloreen',
          password: 'lo',
          displayName: 'Lola Loreen',
          createdAt: 400400,
        },
      ]);
      expect(result.insertedCount).toBe(2);
    });

    it('should be able to explain loginName & password (with index)', async () => {
      const explain = await dmdb.explain<IUser>({
        collectionName: COMPANY_USER_COLLECTION_NAME,
        filter: {
          loginName: 'jsmith',
          password: 'yo',
        },
      });
      expect(explain.usedIndexName).toBe('Login name indexer');
    });

    it('should be able to explain displayName (no index)', async () => {
      const explain = await dmdb.explain<IUser>({
        collectionName: COMPANY_USER_COLLECTION_NAME,
        filter: {displayName: 'Lola Loreen'},
      });
      expect(explain.usedIndexName).toBe(undefined);
    });

    it('should clean up the test things', async () => {
      await dmdb._debug_changeVersion(COMPANY_USER_COLLECTION_NAME, -1);
      const result = await dmdb.dropCollection(COMPANY_USER_COLLECTION_NAME);
      expect(result).toBe(true);
    });

  });

});
