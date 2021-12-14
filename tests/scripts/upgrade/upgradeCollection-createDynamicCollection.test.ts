import "jest";
import {DynaMongoDB} from "../../../src";
import {ICollectionsUpgrades} from "../../../src/UpgradeCollectionsManager";
import {testConnectionInfo} from "../../setup/testConnectionInfo";

const USERS_COLLECTION_NAME = 'test-48823-users-003';
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

describe('Upgrade Dynamic Collections', () => {
  let dmdb: DynaMongoDB;
  beforeAll(done => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
      upgradeCollections,
    });
    dmdb
      .connect()
      .then(() => done());
  });
  afterAll(done => {
    (async () => {
      // Await new Promise(r => setTimeout(r, 100));
      await dmdb.disconnect();
      done();
    })();
  });

  describe('Create dynamic collection', () => {
    it('Test collection should not exist', done => {
      (async () => {
        const exists = await dmdb.collectionExists(COMPANY_USER_COLLECTION_NAME);
        expect(exists).toBe(false);
        done();
      })();
    });

    it('should create new collection and fetch the default doc with code 2', done => {
      (async () => {
        const doc = await dmdb.findFirst<any>({
          collectionName: COMPANY_USER_COLLECTION_NAME,
          filter: {code: 2},
        });

        expect(doc).not.toBe(null);
        expect(doc.code).toBe(2);
        done();
      })();
    });

    it('Add one more upgrade and check the upgrade of the collection', done => {
      (async () => {
        const tryDoc = await dmdb.findFirst<any>({
          collectionName: COMPANY_USER_COLLECTION_NAME,
          filter: {code: 3},
        });
        expect(tryDoc).toBe(null);

        upgradeCollections[USERS_COLLECTION_NAME].upgrades.push({
          version: 22,
          title: 'Add the second doc',
          method: async ({
            db, collectionName,
          }) => {
            const collection = await db.collection<any>(collectionName);
            await collection.insertOne({
              code: 3,
              info: 'My 3rd doc',
            });
          },
        },
        );

        // Reconnect to force the new upgrade scripts
        await dmdb.reconnect();
        const doc = await dmdb.findFirst<any>({
          collectionName: COMPANY_USER_COLLECTION_NAME,
          filter: {code: 3},
        });
        expect(doc).not.toBe(null);
        expect(doc.code).toBe(3);
        done();
      })();
    });

    it('should clean up the test things', done => {
      (async () => {
        try {
          await dmdb._debug_changeVersion(COMPANY_USER_COLLECTION_NAME, -1);
          await dmdb.dropCollection(COMPANY_USER_COLLECTION_NAME);
        }
        catch (e) {
          fail({
            message: 'Test cleanup failed',
            error: e,
          });
        }
        finally {
          console.log('Test finished');
          done();
        }
      })();
    });

  });

});
