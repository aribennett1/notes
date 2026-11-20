import 'zone.js';
import '@angular/compiler';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { webcrypto } from 'node:crypto';
import { CryptoService, Workspace } from '../src/app/core/crypto.service';

Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});
// Keep this test focused on AES-GCM and encoding; Argon2 runs in the browser.
(globalThis as any).argon2={ArgonType:{Argon2id:2},hash:async({pass,salt}:any)=>({hash:new Uint8Array(await webcrypto.subtle.digest('SHA-256',Buffer.concat([Buffer.from(pass),Buffer.from(salt)])))})};
test('large encrypted workspace survives encoding and decryption',async()=>{
 const service=new CryptoService();const workspace:Workspace={schemaVersion:1,nextClientId:2,clients:[{id:1,name:'Synthetic',createdAt:'2026-01-01',updatedAt:'2026-01-01',content:'Synthetic notes\n'.repeat(100_000)}]};
 const envelope=await service.encrypt(workspace,'test password');assert.deepEqual(await service.decrypt(envelope,'test password'),workspace);
});
