const test=require('node:test');const assert=require('node:assert/strict');const {authorize}=require('../dist/authorization.js');
const middleware=authorize(async token=>{if(token==='invalid')throw Error('invalid');return {uid:token}},'approved');
async function check(header){let result;await middleware({header:()=>header},{sendStatus:code=>{result=code}},()=>{result=200});return result}
test('rejects missing token',async()=>assert.equal(await check(undefined),401));
test('rejects invalid token',async()=>assert.equal(await check('Bearer invalid'),401));
test('rejects unauthorized UID',async()=>assert.equal(await check('Bearer another-user'),403));
test('accepts approved UID',async()=>assert.equal(await check('Bearer approved'),200));
