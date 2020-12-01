import {Db, MongoClient, ObjectId, Collection, FilterQuery, SortOptionObject, CursorResult} from "mongodb";
import {UpgradeCollectionsManager, ICollectionsUpgrades, IUpgradeCollectionResults} from "./UpgradeCollectionsManager";

export interface IDynaMongoDBConfig {
  connectionString: string;
  databaseName: string;
  upgradeDatabase?: IDatabaseUpgrade[];
  upgradeCollections?: ICollectionsUpgrades;
  onUpgradeError?: (collectionName: string, version: number, error: any) => void;
}

export interface IDatabaseUpgrade {
  version: number;
  title: string;
  description?: string;
  method: (params: { db: Db }) => Promise<void>;
}

export interface IDynaMongoDBExplain {
  mongoDBExplain: CursorResult;
  usedIndex?: string;
  usedIndexName?: string;
}

export class DynaMongoDB {
  private db: Db | null = null;
  private mongoClient: MongoClient | null = null;
  private readonly upgradeCollectionsManager: UpgradeCollectionsManager;
  private collectionsCache: { [collectionName: string]: Collection<any> } = {};

  constructor(private readonly config: IDynaMongoDBConfig) {
    this.upgradeCollectionsManager = new UpgradeCollectionsManager({
      dmdb: this,
      upgradeCollections: {
        '@@dyna-mongo-db--database': {
          upgrades: this.config.upgradeDatabase || [],
        },
        ...(this.config.upgradeCollections || {}),
      },
      onUpgradeError: this.config.onUpgradeError,
    });
  }

  // DB Connection / Disconnection

  public async connect(): Promise<Db> {
    const {
      connectionString,
      databaseName,
    } = this.config;

    this.mongoClient = await MongoClient.connect(
      encodeURI(connectionString),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );

    this.db = this.mongoClient.db(databaseName);

    await this.upgradeDatabase();

    return this.db;
  }

  public async getDb(): Promise<Db> {
    if (this.db) return this.db;
    return this.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this.mongoClient) return;
    if (!this.db) return;
    this.collectionsCache = {};
    await this.mongoClient.close();
    this.mongoClient = null;
    this.db = null;
  }

  public async reconnect(): Promise<Db> {
    await this.disconnect();
    return this.connect();
  }

  // General tools

  public ObjectId = ObjectId;

  // Collection tools

  public async createCollection<TSchema>(collectionName: string): Promise<Collection<TSchema>> {
    const db = await this.getDb();
    const collection = await db.createCollection<TSchema>(collectionName);
    await this.upgradeCollectionsManager.upgradeCollection(collectionName);
    this.collectionsCache[collectionName] = collection;
    return collection;
  }

  public async getCollectionNames(): Promise<string[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.listCollections().toArray((err, collections) => {
        if (err)
          reject(err);
        else
          resolve(
            collections
              .map(collectionInfo => collectionInfo.name),
          );
      });
    });
  }

  public async collectionExists(collectionName: string): Promise<boolean> {
    const collectionNames = await this.getCollectionNames();
    return collectionNames.indexOf(collectionName) > -1;
  }

  public async getCollection<TSchema>(collectionName: string): Promise<Collection<TSchema>> {
    const db = await this.getDb();
    const cachedCollection = this.collectionsCache[collectionName];
    if (cachedCollection) return cachedCollection;
    await this.upgradeCollectionsManager.upgradeCollection(collectionName);
    const collection = db.collection<TSchema>(collectionName);
    this.collectionsCache[collectionName] = collection;
    return collection;
  }

  public async dropCollection(collectionName: string): Promise<boolean> {
    const db = await this.getDb();
    await this.upgradeCollectionsManager.dropCollection(collectionName);
    try {
      await db.dropCollection(collectionName);
      delete this.collectionsCache[collectionName];
      return true;
    } catch (e) {
      if (e.name = 'MongoError' && e.code === 26 && e.message === 'ns not found') return false;
      throw e;
    }
  }

  public getCollectionVersion(collectionName: string): Promise<number> {
    return this.upgradeCollectionsManager.getCollectionVersion(collectionName);
  }

  // Upgrade methods

  public addCollectionsUpgrades(collectionsUpgrades: ICollectionsUpgrades): void {
    this.upgradeCollectionsManager.addCollectionsUpgrades(collectionsUpgrades);
  }

  public upgradeDatabase(): Promise<IUpgradeCollectionResults> {
    return this.upgradeCollectionsManager.upgradeCollection('@@dyna-mongo-db--database');
  }

  public upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults> {
    return this.upgradeCollectionsManager.upgradeCollection(collectionName);
  }

  // Document tools

  public async findFirst<TSchema = any>(
    {
      collectionName,
      filter = {},
      sort = {},
    }
      : {
      collectionName: string;
      filter?: FilterQuery<TSchema>;
      sort?: SortOptionObject<TSchema>; // MongoDB does not guarantee the order of query results, you should order them
    },
  ): Promise<TSchema | null> {
    const items = await this.find<TSchema>({
      collectionName,
      filter,
      sort,
      limit: 1,
    });
    return items[0] || null;
  }

  public async find<TSchema = any>(
    {
      collectionName,
      filter = {},
      sort = {},
      limit,
    }
      : {
      collectionName: string;
      filter?: FilterQuery<TSchema>;
      sort?: SortOptionObject<TSchema>; // MongoDB does not guarantee the order of query results, you should order them
      limit?: number;
    },
  ): Promise<TSchema[]> {
    const collection = await this.getCollection<TSchema>(collectionName);
    return limit === undefined
      ? collection.find<TSchema>(filter).sort(sort).toArray()
      : collection.find<TSchema>(filter).sort(sort).limit(limit).toArray();
  }

  public async explain<TSchema = any>(
    {
      collectionName,
      filter = {},
      sort = {},
      limit,
    }
      : {
      collectionName: string;
      filter?: FilterQuery<TSchema>;
      sort?: SortOptionObject<TSchema>; // MongoDB does not guarantee the order of query results, you should order them
      limit?: number;
    },
  ): Promise<IDynaMongoDBExplain> {
    const collection = await this.getCollection<TSchema>(collectionName);
    const mongoExplain: any = await (
      limit === undefined
        ? collection.find<TSchema>(filter).sort(sort).explain()
        : collection.find<TSchema>(filter).sort(sort).limit(limit).explain()
    );

    return {
      mongoDBExplain: mongoExplain,
      usedIndex: mongoExplain?.queryPlanner?.winningPlan?.inputStage,
      usedIndexName: mongoExplain?.queryPlanner?.winningPlan?.inputStage?.indexName,
    };
  }

  public _debug_changeVersion(collectionName: string, version: number): Promise<void> {
    return this.upgradeCollectionsManager._debug_changeVersion(collectionName, version);
  }
}
