import "../dyna/unhandledPromiseRejections";
import {DynaMongoDB} from "../src";
import {testConnectionInfo} from "../tests/setup/testConnectionInfo";

console.info('Dev emv started');

(global as any).dmdb = new DynaMongoDB({
  connectionString: testConnectionInfo.connectionString,
  databaseName: testConnectionInfo.databaseName,
});

console.debug('Time to play with your global.dmdb', (global as any).dmdb);

// new Promise(r => r); // Do not terminate the instance

setInterval(() => undefined, 100);

