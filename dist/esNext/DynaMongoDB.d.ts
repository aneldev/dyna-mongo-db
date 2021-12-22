import { Db, ObjectId, Collection, Document, Filter, Sort } from "mongodb";
import { ICollectionsUpgrades, IUpgradeCollectionResults } from "./UpgradeCollectionsManager";
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
    method: (params: {
        db: Db;
    }) => Promise<void>;
}
export interface IDynaMongoDBExplain {
    mongoDBExplain: Document;
    usedIndex?: string;
    usedIndexName?: string;
}
export declare class DynaMongoDB {
    private readonly config;
    private db;
    private mongoClient;
    private queue;
    private readonly upgradeCollectionsManager;
    private collectionsCache;
    constructor(config: IDynaMongoDBConfig);
    connect(): Promise<Db>;
    getDb(): Promise<Db>;
    disconnect(): Promise<void>;
    reconnect(): Promise<Db>;
    ObjectId: typeof ObjectId;
    createCollection<TSchema>(collectionName: string): Promise<Collection<TSchema>>;
    getCollectionNames(): Promise<string[]>;
    collectionExists(collectionName: string): Promise<boolean>;
    getCollection<TSchema>(collectionName: string): Promise<Collection<TSchema>>;
    dropCollection(collectionName: string): Promise<boolean>;
    getCollectionVersion(collectionName: string): Promise<number>;
    addCollectionsUpgrades(collectionsUpgrades: ICollectionsUpgrades): void;
    upgradeDatabase(): Promise<IUpgradeCollectionResults>;
    upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults>;
    findFirst<TSchema = any>({ collectionName, filter, sort, }: {
        collectionName: string;
        filter?: Filter<TSchema>;
        sort?: Sort;
    }): Promise<TSchema | null>;
    find<TSchema = any>({ collectionName, filter, sort, limit, }: {
        collectionName: string;
        filter?: Filter<TSchema>;
        sort?: Sort;
        limit?: number;
    }): Promise<TSchema[]>;
    explain<TSchema = any>({ collectionName, filter, sort, limit, }: {
        collectionName: string;
        filter?: Filter<TSchema>;
        sort?: Sort;
        limit?: number;
    }): Promise<IDynaMongoDBExplain>;
    _debug_changeVersion(collectionName: string, version: number): Promise<void>;
}
