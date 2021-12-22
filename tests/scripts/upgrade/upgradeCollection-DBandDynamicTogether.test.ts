import {
  DynaMongoDB,
  IDatabaseUpgrade,
} from "../../../src";
import {ICollectionsUpgrades} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";
import {removeMongoDbIds} from "../../utils/removeMongoDbIds";

const DB_INFO_COLLECTION_NAME = 'test-48823-db-info-001';

const USERS_COLLECTION_NAME = 'test-48823-users-002';
const COMPANY_USER_COLLECTION_NAME = 'demo-company---' + USERS_COLLECTION_NAME;


const upgradeDatabase: IDatabaseUpgrade[] = [
  {
    version: 10,
    title: 'Creation db info',
    method: async ({db}) => {
      await db.createCollection(DB_INFO_COLLECTION_NAME);
    },
  },
  {
    version: 12,
    title: 'Add the first doc',
    method: async ({db}) => {
      const collection = db.collection<any>(DB_INFO_COLLECTION_NAME);
      await collection.insertOne({
        code: 1,
        info: 'DB info doc 1',
      });
    },
  },
];

const upgradeCollections: ICollectionsUpgrades = {
  [USERS_COLLECTION_NAME]: {
    upgrades: [
      {
        version: 10,
        title: 'Creation of the collection',
        method: async (
          {
            collectionName,
            db,
          },
        ) => {
          await db.createCollection(collectionName);
        },
      },
      {
        version: 12,
        title: 'Add the first doc',
        method: async (
          {
            db,
            collectionName,
          },
        ) => {
          const collection = db.collection<any>(collectionName);
          await collection.insertOne({
            code: 1,
            info: 'My 1st doc',
          });
        },
      },
      {
        version: 20,
        title: 'Add the second doc',
        method: async (
          {
            db,
            collectionName,
          },
        ) => {
          const collection = db.collection<any>(collectionName);
          await collection.insertOne({
            code: 2,
            info: 'My 2nd doc',
          });
        },
      },
    ],
  },
};

describe('Upgrade DB & Dynamic Collections', () => {
  let dmdb: DynaMongoDB;

  beforeAll(async () => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeDatabase,
      upgradeCollections,
    });
    await dmdb.connect();
  });
  afterAll(async () => {
    await dmdb.dropCollection(DB_INFO_COLLECTION_NAME);
    await dmdb.dropCollection(COMPANY_USER_COLLECTION_NAME);
    await dmdb._debug_changeVersion('@@dyna-mongo-db--database', -1);
    await dmdb.disconnect();
  });

  describe('Create dynamic collection', () => {
    it('Test collection should not exist', async () => {
      const exists = await dmdb.collectionExists(COMPANY_USER_COLLECTION_NAME);
      expect(exists).toBe(false);
    });

    it('should create new collection and fetch the default doc with code 2', async () => {
      const doc = await dmdb.findFirst<any>({
        collectionName: COMPANY_USER_COLLECTION_NAME,
        filter: {code: 2},
      });

      expect(doc).not.toBe(null);
      expect(doc.code).toBe(2);
    });

    it('Add one more upgrade and check the upgrade of the collection', async () => {
      const tryDoc = await dmdb.findFirst<any>({
        collectionName: COMPANY_USER_COLLECTION_NAME,
        filter: {code: 3},
      });
      expect(tryDoc).toBe(null);

      upgradeCollections[USERS_COLLECTION_NAME].upgrades.push({
        version: 22,
        title: 'Add the second doc',
        method: async (
          {
            db,
            collectionName,
          },
        ) => {
          const collection = await db.collection<any>(collectionName);
          await collection.insertOne({
            code: 3,
            info: 'My 3rd doc',
          });
        },
      });

      // Reconnect to force the new upgrade scripts
      await dmdb.reconnect();
      const doc = await dmdb.findFirst<any>({
        collectionName: COMPANY_USER_COLLECTION_NAME,
        filter: {code: 3},
      });
      expect(doc).not.toBe(null);
      expect(doc.code).toBe(3);
    });

    it('should get the doc of the DB upgrade', async () => {
      const dbInfoDocs = await dmdb.find({collectionName: DB_INFO_COLLECTION_NAME});
      expect(dbInfoDocs.length).toBe(1);
      expect(dbInfoDocs[0].code).toBe(1);
    });

    it('Add dynamically DB upgrade script execute it and check', async () => {
      upgradeDatabase.push({
        version: 20,
        title: 'Add the second doc',
        method: async ({db}) => {
          const collection = db.collection<any>(DB_INFO_COLLECTION_NAME);
          await collection.insertOne({
            code: 2,
            info: 'DB info doc 2',
          });
        },
      },
      );

      await dmdb.disconnect();

      const dbInfoDocs = await dmdb.find({collectionName: DB_INFO_COLLECTION_NAME});
      expect(dbInfoDocs.length).toBe(2);
      expect(removeMongoDbIds(dbInfoDocs)).toMatchSnapshot();
    });
  });

});
