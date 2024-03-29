import {DynaMongoDB} from "../../../src";
import {
  ICollectionsUpgrades,
  UpgradeCollectionsManager,
} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

const USERS_COLLECTION_NAME = 'test-48823-users-001';
const COMPANY_USER_COLLECTION_NAME = 'demo-company---' + USERS_COLLECTION_NAME;

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
        version: 12,
        title: 'Add the first doc',
        method: async ({
          db, collectionName,
        }) => {
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
        method: async ({
          db, collectionName,
        }) => {
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

describe('Upgrade Collections', () => {
  let dmdb: DynaMongoDB;
  let upgradeCollectionManager: UpgradeCollectionsManager;

  const clearDb = async (): Promise<void> => {
    await dmdb.dropCollection(COMPANY_USER_COLLECTION_NAME);
  };

  beforeAll(async () => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeCollections,
    });
    upgradeCollectionManager = new UpgradeCollectionsManager({
      dmdb,
      upgradeCollections,
    });
    await clearDb();
  });
  afterAll(async () => {
    await clearDb();
    await dmdb.disconnect();
  });

  describe('Upgrade Dynamic with Upgrade manager', () => {
    it('First Upgrade', async () => {
      const report = await upgradeCollectionManager.upgradeCollection(COMPANY_USER_COLLECTION_NAME);
      expect(report).toMatchSnapshot();
      expect(report.plannedUpgrades).toBe(3);
      expect(report.appliedUpgrades).toBe(3);
    });

    it('Should not upgrade again', async () => {
      const report = await upgradeCollectionManager.upgradeCollection(COMPANY_USER_COLLECTION_NAME);
      expect(report).toMatchSnapshot();
      expect(report.plannedUpgrades).toBe(0);
      expect(report.appliedUpgrades).toBe(0);
    });

    it('Add one more version', async () => {
      upgradeCollections[USERS_COLLECTION_NAME].upgrades.push({
        version: 30,
        title: 'Add the second doc',
        method: async (
          {
            db,
            collectionName,
          },
        ) => {
          const collection = db.collection<any>(collectionName);
          await collection.insertOne({
            code: 3,
            info: 'My 3rd doc',
          });
        },
      });

      const report = await upgradeCollectionManager.upgradeCollection(COMPANY_USER_COLLECTION_NAME);
      expect(report).toMatchSnapshot();
      expect(report.plannedUpgrades).toBe(1);
      expect(report.appliedUpgrades).toBe(1);
    });

  });

});
