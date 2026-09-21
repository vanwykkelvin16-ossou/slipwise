import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Writable} from 'node:stream';
import {createInterface} from 'node:readline/promises';
if(!process.stdin.isTTY)throw new Error('Run admin:setup in your own interactive terminal.');
let muted=false;
const output=new Writable({write(chunk,enc,done){if(!muted)process.stdout.write(chunk,enc);done()}});
const prompt=createInterface({input:process.stdin,output,terminal:true});
async function secret(label){process.stdout.write(label);muted=true;try{return await prompt.question('')}finally{muted=false;process.stdout.write('\n')}}
const password=await secret('Initial admin password (hidden): ');
const confirm=await secret('Confirm password (hidden): ');prompt.close();
if(password!==confirm||password.length<8||password.length>128)throw new Error('Passwords must match and contain 8–128 characters.');
const salt=randomBytes(16).toString('hex');
const hash=`pbkdf2$100000$${salt}$${pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')}`;
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put','ADMIN_PASSWORD_HASH','--name','slipwise'],{input:hash+'\n',stdio:['pipe','inherit','inherit']});
if(result.error)throw result.error;process.exit(result.status??1);
