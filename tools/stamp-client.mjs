import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../public/',import.meta.url),hash=createHash('sha256');
const appUrl=new URL('app.js',root);let app=await readFile(appUrl,'utf8');
const body=app.replace(/^const CLIENT_VERSION='[^']*';\r?\n/,'').replace(/\r\n/g,'\n');
hash.update(body);for(const file of ['style.css','index.html','audio.mjs'])hash.update((await readFile(new URL(file,root),'utf8')).replace(/\r\n/g,'\n'));
const version=hash.digest('hex').slice(0,16);
const next=`const CLIENT_VERSION='${version}';\n`+body;if(next!==app)await writeFile(appUrl,next);
export {version};
