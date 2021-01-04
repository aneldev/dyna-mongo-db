import {DynaMongoDB} from "./index";
import {Collection, Db} from "mongodb";
import {DynaJobQueue} from "dyna-job-queue";
import {IError} from "dyna-interfaces";

export interface IUpgradeCollectionsManagerConfig {
  dmdb: DynaMongoDB;
  upgradeCollections: ICollectionsUpgrades;
  onUpgradeError?: (collectionName: string, version: number, error: any) => void;
}

export interface ICollectionsUpgrades {
  [collectionName: string]: ICollectionUpgrades;
}

export interface ICollectionUpgrades {
  upgrades: ICollectionUpgrade[];
}

export interface ICollectionUpgrade {
  version: number;
  title: string;
  description?: string;
  method: (params: { db: Db, collectionName: string }) => Promise<void>;
}

interface IDBCollectionVersionInfo {
  collectionName: string;
  version: number;
}

export interface IUpgradeCollectionResults {
  initialVersion: number | null;
  upgradeToVersion: number | null;
  hasUpgrades: boolean | null;
  plannedUpgrades: number;
  appliedUpgrades: number;
}

const COLLECTION_VERSIONS_COLLECTION_NAME = 'dyna-mongo-db--upgrade-manager';

export class UpgradeCollectionsManager {
  private readonly dmdb = this.config.dmdb;

  constructor(private readonly config: IUpgradeCollectionsManagerConfig) {
  }

  public addCollectionsUpgrades(collectionsUpgrades: ICollectionsUpgrades): void {
    this.config.upgradeCollections = {
      ...this.config.upgradeCollections,
      ...collectionsUpgrades,
    };
  }

  public async upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults> {
    const queue = new DynaJobQueue();
    let ok = true;
    let error: IError;
    const output: IUpgradeCollectionResults = {
      initialVersion: null,
      upgradeToVersion: null,
      hasUpgrades: null,
      plannedUpgrades: 0,
      appliedUpgrades: 0,
    };
    const asCollectionName: string =
      collectionName.includes('---')
        ? collectionName.split('---')[1]
        : collectionName;

    const collectionVersion = await this.getCollectionVersion(collectionName);
    output.initialVersion = collectionVersion === -2 ? null : collectionVersion;

    const upgradeCollection = this.config.upgradeCollections[asCollectionName];
    output.hasUpgrades = !!upgradeCollection;
    if (!upgradeCollection) return output;

    return new Promise<IUpgradeCollectionResults>((resolve: (output: IUpgradeCollectionResults) => void, reject: (error: IError) => void): void => {
      const collectionMissingVersions =
        upgradeCollection.upgrades
          .sort((a, b) => a.version - b.version)
          .filter(upgradeCollection => upgradeCollection.version > collectionVersion);

      collectionMissingVersions.forEach(upgrade => {
        output.upgradeToVersion = upgrade.version;
        output.plannedUpgrades++;
        queue.addJobPromised(async () => {
          if (!ok) return;
          try {
            await this.checkAndUpgradeCollection(collectionName, upgrade);
            output.appliedUpgrades++;
          } catch (e) {
            ok = false;
            error = e;
          }
        });
      });
      queue.addJobPromised(async () => {
        if (ok) resolve(output);
        reject(error);
      });
    });
  }

  private async checkAndUpgradeCollection(collectionName: string, upgrade: ICollectionUpgrade): Promise<void> {
    console.log(`DynaMongoDB: Upgrade collection "${collectionName}" to version ${upgrade.version} ${upgrade.title}`);
    try {
      const db = await this.dmdb.getDb();
      await upgrade.method({
        db,
        collectionName,
      });
      await this.bumpConnectionCurrentVersion(collectionName, upgrade.version);
      console.log(`DynaMongoDB:  SUCCESS upgrade for collection "${collectionName}" to version ${upgrade.version}`);
    } catch (error) {
      console.error(`DynaMongoDB:  FAILED upgrade for collection "${collectionName}" to version ${upgrade.version}`, error);
      if (this.config.onUpgradeError) {
        this.config.onUpgradeError(collectionName, upgrade.version, error);
      }
      else {
        console.error(`dyna-mongo-db upgrade collection error: collection ${collectionName} on version: ${upgrade.version}`, error);
      }
      throw error;
    }
  }

  public async getCollectionVersion(collectionName: string): Promise<number> {
    const db = await this.dmdb.getDb();

    const versionCollection =
      await db
        .collection(COLLECTION_VERSIONS_COLLECTION_NAME)
        .findOne<IDBCollectionVersionInfo>({collectionName});

    if (versionCollection) return versionCollection.version;
    return -2;
  }

  private async getVersionsCollectionCollection(): Promise<Collection<IDBCollectionVersionInfo>> {
    const db = await this.dmdb.getDb();
    let versionsCollectionsCollection: Collection<IDBCollectionVersionInfo>;
    const collectionExists = await this.dmdb.collectionExists(COLLECTION_VERSIONS_COLLECTION_NAME);

    if (collectionExists) {
      // load
      versionsCollectionsCollection = await db.collection<IDBCollectionVersionInfo>(COLLECTION_VERSIONS_COLLECTION_NAME);
    }
    else {
      // create
      versionsCollectionsCollection = await db.createCollection<IDBCollectionVersionInfo>(COLLECTION_VERSIONS_COLLECTION_NAME);
      await versionsCollectionsCollection.createIndex(
        {
          collectionName: 1,
        },
        {
          name: 'Collection name index',
          unique: true,
        },
      );
    }
    return versionsCollectionsCollection;
  }

  private async bumpConnectionCurrentVersion(collectionName: string, toVersion: number): Promise<void> {
    const versionsCollectionsCollection = await this.getVersionsCollectionCollection();
    const updateResult = await versionsCollectionsCollection
      .updateOne(
        {
          collectionName: collectionName,
        } as IDBCollectionVersionInfo,
        {
          $set: {
            version: toVersion,
          },
        },
        {
          upsert: true,
        },
      );
    if (updateResult.upsertedCount === 0 && updateResult.modifiedCount === 0) {
      throw {
        message: `Cannot update version info collection for collection [${collectionName}] v${toVersion}`,
        data: {collectionName, updateResult},
      };
    }
  }

  public async dropCollection(collectionName: string): Promise<void> {
    const versionsCollectionsCollection = await this.getVersionsCollectionCollection();
    await versionsCollectionsCollection
      .deleteOne(
        {
          collectionName: collectionName,
        } as IDBCollectionVersionInfo,
      );
  }

  public async _debug_changeVersion(collectionName: string, version: number): Promise<void> {
    const versionsCollection = await this.getVersionsCollectionCollection();
    await versionsCollection.updateOne(
      {
        collectionName,
      },
      {
        $set: {version},
      },
    );
  }
}
