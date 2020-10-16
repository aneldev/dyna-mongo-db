import { Db, ObjectId, Collection, FilterQuery, SortOptionObject, CursorResult } from "mongodb";
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
    mongoDBExplain: CursorResult;
    usedIndex?: string;
    usedIndexName?: string;
}
export declare class DynaMongoDB {
    private readonly config;
    private db;
    private mongoClient;
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
    upgradeDatabase(): Promise<IUpgradeCollectionResults>;
    upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults>;
    findFirst<TSchema = any>({ collectionName, filter, sort, }: {
        collectionName: string;
        filter?: FilterQuery<TSchema>;
        sort?: SortOptionObject<TSchema>;
    }): Promise<TSchema | null>;
    find<TSchema = any>({ collectionName, filter, sort, limit, }: {
        collectionName: string;
        filter?: FilterQuery<TSchema>;
        sort?: SortOptionObject<TSchema>;
        limit?: number;
    }): Promise<TSchema[]>;
    explain<TSchema = any>({ collectionName, filter, sort, limit, }: {
        collectionName: string;
        filter?: FilterQuery<TSchema>;
        sort?: SortOptionObject<TSchema>;
        limit?: number;
    }): Promise<IDynaMongoDBExplain>;
    _debug_changeVersion(collectionName: string, version: number): Promise<void>;
}
