import { DynaMongoDB } from "./index";
import { Db } from "mongodb";
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
    method: (params: {
        db: Db;
        collectionName: string;
    }) => Promise<void>;
}
export interface IUpgradeCollectionResults {
    initialVersion: number | null;
    upgradeToVersion: number | null;
    hasUpgrades: boolean | null;
    plannedUpgrades: number;
    appliedUpgrades: number;
}
export declare class UpgradeCollectionsManager {
    private readonly config;
    private readonly dmdb;
    constructor(config: IUpgradeCollectionsManagerConfig);
    upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults>;
    private checkAndUpgradeCollection;
    getCollectionVersion(collectionName: string): Promise<number>;
    private getVersionsCollectionCollection;
    private bumpConnectionCurrentVersion;
    dropCollection(collectionName: string): Promise<void>;
    _debug_changeVersion(collectionName: string, version: number): Promise<void>;
}
