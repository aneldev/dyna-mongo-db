import {DynaMongoDB} from "./index";
import {
  Collection,
  Db,
} from "mongodb";
import {
  dynaError,
  IDynaError,
} from "dyna-error";
import {DynaJobQueue} from "dyna-job-queue";

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
  method: (params: { db: Db; collectionName: string }) => Promise<void>;
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
    this.checkUpgradeVersions(config.upgradeCollections);
  }

  public addCollectionsUpgrades(collectionsUpgrades: ICollectionsUpgrades): void {
    this.checkUpgradeVersions(collectionsUpgrades);
    this.config.upgradeCollections = {
      ...this.config.upgradeCollections,
      ...collectionsUpgrades,
    };
  }

  public async upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults> {
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

    return new Promise<IUpgradeCollectionResults>((resolve: (output: IUpgradeCollectionResults) => void, reject: (error: IDynaError) => void): void => {
      const queue = new DynaJobQueue();
      let ok = true;
      let error: IDynaError;

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
          }
          catch (e) {
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
    }
    catch (error) {
      const errorMessage = `DynaMongoDB: FAILED upgrade for collection "${collectionName}" to version ${upgrade.version}`;
      console.error(errorMessage, error);
      if (this.config.onUpgradeError) this.config.onUpgradeError(collectionName, upgrade.version, error);
      throw dynaError({
        code: 202206230850,
        message: errorMessage,
        parentError: error,
      });
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
      // Load
      versionsCollectionsCollection = await db.collection<IDBCollectionVersionInfo>(COLLECTION_VERSIONS_COLLECTION_NAME);
    }
    else {
      // Create
      versionsCollectionsCollection = await db.createCollection<IDBCollectionVersionInfo>(COLLECTION_VERSIONS_COLLECTION_NAME);
      await versionsCollectionsCollection.createIndex(
        {collectionName: 1},
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
        {collectionName: collectionName} as IDBCollectionVersionInfo,
        {$set: {version: toVersion}},
        {upsert: true},
      );
    if (updateResult.upsertedCount === 0 && updateResult.modifiedCount === 0) {
      throw dynaError({
        message: `Cannot update version info collection for collection [${collectionName}] v${toVersion}`,
        data: {
          collectionName,
          updateResult,
        },
      });
    }
  }

  public async dropCollection(collectionName: string): Promise<void> {
    const versionsCollectionsCollection = await this.getVersionsCollectionCollection();
    await versionsCollectionsCollection
      .deleteOne(
        {collectionName: collectionName} as IDBCollectionVersionInfo,
      );
  }

  private checkUpgradeVersions(collectionsUpgrades: ICollectionsUpgrades): void {
    const errors: string[] = [];
    Object.keys(collectionsUpgrades)
      .forEach(collectionName => {
        const collectionUpgrades = collectionsUpgrades[collectionName];
        collectionUpgrades.upgrades.forEach((collectionUpgrade, index, arr) => {
          const prev = arr[index - 1];
          if (!prev) return;
          if (collectionUpgrade.version <= prev.version) {
            errors.push(`DynaMongoDB: error: 202206230915: Upgrade script for collection [${collectionName}] "${collectionUpgrade.title}" version (${collectionUpgrade.version}) has lower or same version with the previous upgrade script!!! Version numbers should be sequential!!!`);
          }
        });
      });
    if (errors.length) {
      errors.forEach(e => console.error(e));
      throw dynaError({
        code: 202206230915,
        message:
          errors.length === 1
            ? errors[0]
            : `DynaMongoDB: error: 202206230915: There are ${errors.length} Upgrade scripts with wrong versions!!!`,
        data: {errors},
      });
    }
  }

  public async _debug_changeVersion(collectionName: string, version: number): Promise<void> {
    const versionsCollection = await this.getVersionsCollectionCollection();
    await versionsCollection.updateOne(
      {collectionName},
      {$set: {version}},
    );
  }
}
