# Dyna Mongo DB - Upgrade Mechanism

# Full version of the DynaMongoDb config

```
interface IDynaMongoDBConfig {
  connectionString: string;
  databaseName: string;
  upgradeDatabase?: IDatabaseUpgrade[];
  upgradeCollections?: ICollectionsUpgrades;
  onUpgradeError?: (collectionName: string, version: number, error: any) => void;
}
```

- `upgradeDatabase`: To upgrade a whole database.
- `upgradeCollections`: To upgrade a collection _or dynamic collections_
- `upgradeDatabase`: To catch the Upgrade errors from both of the above methods.

> You can use both Database and Collection Upgrades.

# Upgrade database

## Setup

To make a database upgradable you have to pass the `upgradeDatabase` on `DynaMongoDB` instantiation.

```
const dmdb = new DynaMongoDB({
  connectionString: '<my mongodb connection string>', 
  databaseName: 'happy-cars-production',
  upgradeDatabase, // <-- this one
  onUpgradeError: (collectionName: string, version: number, error: any) => console.error('Upgrade failed on collection', collection, 'version', version, error),
})
```

This property should be an array of `IDatabaseUpgrade` which it is:

```
interface IDatabaseUpgrade {
  version: number;
  title: string;
  description?: string;
  method: (params: { db: Db }) => Promise<void>;
}
```
- `version`: every version should be unique, the version would be non-sequential
- `title`: Title of this Upgrade, this is consoled
- `description`: (optional) Few words about this Upgrade, _not consoled_.
- `method`: The callback method, a promised one, will perform the Upgrade for this version. 

The `method` should be resolved when all work has been completed.

The `method` would be rejected if something went completely wrong. If an exception is thrown again, it is assumed as rejected. In this case the method that started the operation (`getCollection()`, `find()`) will be rejected. A `console.error` by default is consoled you will see this error on the server's console.

Example for the `upgradeDatabase` property:

```
const upgradeDatabase: IDatabaseUpgrade[] = [
  {
    version: 1,
    title: 'Create users table',
    method: async ({db}) => {
      await db.createCollection('users');
    },
  },
  {
    version: 12,
    title: 'Create Users name indexer',
    method: async ({db}) => {
      const collection = await db.collection('users')
      await collection.createIndex(
        { date: 1 },
        { name: 'name indexer' },
      );
    },
  },
];
```
> NOTE: In the method always `await` the operations!

> NOTE: Do not use the instance of DynaMongoDB (like dmdb) inside the Upgrade Methods!

## Lifecycle

The Upgrade methods are running on Database's connect.

# Upgrade Collection

## Setup

Like the databases, you can Upgrade collections in exactly the same way. You just have to create a dictionary object using the Collection name as key.

For Example:

```
const dmdb = new DynaMongoDB({
  connectionString: '<my mongodb connection string>', 
  databaseName: 'happy-cars-production',
  upgradeCollections, // <-- this one
  onUpgradeError: (collectionName: string, version: number, error: any) => console.error('Upgrade failed on collection', collection, 'version', version, error),
})
```

Where `collectionUpgrades` is:

```
const collectionUpgrades: ICollectionsUpgrades = {
  "users": { // <-- this is the name of the Collection
    upgrades: [
      {
        version: 1,
        title: 'Creation of the collection',
        method: async ({collectionName, db}) => {
          // Note: Use the `collectionName` of the argument and not hardcoded the `users`!
          await db.createCollection(collectionName);
        },
      },
      {
        version: 2,
        title: 'Add the first doc',
        method: async ({db, collectionName}) => {
          const collection = await db.collection('users')
          await collection.createIndex(
            { loginName: 1 },
            { name: 'Login name indexer' },
          );
        },
      },
    ],
  },
};
```

> NOTE: In the method always `await` the operations!

> NOTE: In the `method` use **always** the `collectionName` that is provided by the argument, to support the Dynamic Collections! _For dynamic collections, the collection name will be different._
>
> NOTE: Do not use the instance of DynaMongoDB (like dmdb) inside the Upgrade Methods!

## Usage 

Then you can use the `users` collection without even creating it.

```
const usersCollection = await dmdb.getCollection('users');
usersCollection.insertOne({id: 1, fname: 'John', lname: 'Smith', loginName: 'jsmith'});
```

Once we have Upgrade methods for the `users` Collection, we can create dynamic Collections that will use these Upgrades and have the same features!

```
const usersCollection = await dmdb.getCollection('super-company---users');
// At this point the all upgrades of the `"users"` Collection have been applied.
usersCollection.insertOne({id: 1, fname: 'John', lname: 'Smith', loginName: 'jsmith'});
```

## Lifecycle

The Upgrade operation for a collection is taking part on the first use of the Collection after DB's connection.

If you re-connect to DB, the Upgrade operation will take part on first use of the Collection again.

If an Upgrade version fails, it will be retried on the next Collection's usage.

If you add on runtime Upgrade methods (for development or testing) you should re-connect to DB. 

# Upgrade Dynamic Connections (the three dashes `---`)

Dynamic Collection is a Collection with a name that ends with `---<name>`.

Imagine that there is an Upgrade for the Collection with the name `users`.
If you create a Collection with the name `super-company---users`, then this Collection is called dynamic since the Upgrade methods of the `users` Collection will be applied on it.

Also, it is not needed to have a collection with an exact name. For instance, it is not required to have a Collection with the name `users`. You can have Collections that are ending with `---users`, and the Upgrades will be applied on them.

On the other hand, if there are no Upgrades for the `users` Collection, nothing will happen, no errors. At a later time, if you create Upgrades the `users`, they will be applied to `users` and all Collections ending with `-- users`.

# Error handling

The Upgrade methods (like the old SQL migration scripts) should not fail.  

The Upgrade Fails will bubble up to any DB method of Dyna Mongo DB.
This is normal. The same happens for any kind of error, network error, disk error, anything. 
The error would be something temporary or... permanent. _Deal with it._

To catch the Upgrade Fails use the `onUpgradeError` callback.

# Upgrade methods

You don’t need to use these upgrade methods except if you want to upgrade the database or collections on Application’s upgrade time.

## upgradeDatabase(): Promise<IUpgradeCollectionResults>

It runs the needed Upgrade Methods to Upgrade the database

## upgradeCollection(collectionName: string): Promise<IUpgradeCollectionResults>

It runs the needed Upgrade Methods to Upgrade the collection and the dynamic collections of this `collectionName`

## Upgrade methods error handling

If an error occurs, the Promised methods will be fulfilled with rejection of the error.

## Return interface or the upgrade methods

On success Upgrade, the following object is resolved.
```
interface IUpgradeCollectionResults {
  initialVersion: number | null;
  upgradeToVersion: number | null;
  hasUpgrades: boolean | null;
  plannedUpgrades: number;
  appliedUpgrades: number;
}
```

# Test/Debug upgrade methods

You can use the upgrade methods to see if the methods are compatible with a production db (with a copy of production db of course).

If you want to change the Upgrade version of the database, you can change it on `dyna-mongo-db--upgrade-manager` collection.

For the Database Upgrade version, the collection name is `@@dyna-mongo-db--database`.

There is a debug method to change the version number programmatically: 

`_debug_changeVersion(collectionName: string, version: number): Promise<void>`

# Technical info

The Dyna Mongo DB keeps the versions on `dyna-mongo-db--upgrade-manager` collection. _Do not drop this Collection._

# Sum up

- Upgrades are just Promised methods.
- Inside these methods, we have only the instance of the MongoDB `db`.
- Through the `db` instance, we create the Collections and anything needed.
- The Dyna Mondo DB takes care when to run these Upgrade Methods.
- The same Upgrade methods applied to Dynamic Collections 
