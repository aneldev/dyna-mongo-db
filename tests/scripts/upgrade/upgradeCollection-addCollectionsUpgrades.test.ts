import "jest";
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

describe('Add collection upgrades', () => {
  let dmdb: DynaMongoDB;
  beforeAll(done => {
    dmdb = new DynaMongoDB({
      connectionString: testConnectionInfo.connectionString,
      databaseName: testConnectionInfo.databaseName,
    });
    dmdb.addCollectionsUpgrades(collectionUpgrades);
    dmdb
      .connect()
      .then(() => done());
  });
  afterAll(done => {
    (async () => {
      await dmdb.disconnect();
      done();
    })();
  });

  describe('Create Collection', () => {
    it('Test collection should not exist', done => {
      (async () => {
        const exists = await dmdb.collectionExists(TEST_COLLECTION_NAME);
        expect(exists).toBe(false);
        done();
      })();
    });

    it('should create new collection and fetch the default doc with code 2', done => {
      (async () => {
        const doc = await dmdb.findFirst<any>({
          collectionName: TEST_COLLECTION_NAME,
          filter: {code: 2},
        });

        expect(doc).not.toBe(null);
        expect(doc.code).toBe(2);
        done();
      })();
    });

    it('should clean up the test things', done => {
      (async () => {
        try {
          await dmdb.dropCollection(TEST_COLLECTION_NAME);
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
