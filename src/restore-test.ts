import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CryptoService, Envelope, Workspace } from './app/core/crypto.service';

@Component({standalone:true,imports:[FormsModule],selector:'app-restore-test',template:`
<main class="restore-test">
  <h1>Encrypted restore test</h1>
  <p>Choose the encrypted workspace downloaded from Google Cloud Storage and enter its master encryption password. Decryption runs locally; this test does not save or upload the file.</p>
  <label>Encrypted workspace file <input type="file" (change)="chooseFile($event)"></label>
  <label>Master encryption password <input type="password" [(ngModel)]="password" autocomplete="off"></label>
  <button (click)="open()" [disabled]="!file || busy()">{{busy() ? 'Decrypting…' : 'Decrypt and inspect'}}</button>
  <p role="status">{{message()}}</p>
  @if(workspace(); as restored) {
    <h2>Decryption successful</h2><p>{{restored.clients.length}} client(s) found. This is a read-only preview.</p>
    @for(client of restored.clients; track client.id) {<details><summary>{{client.name}}</summary><pre>{{client.content}}</pre></details>}
    <button (click)="clear()">Clear preview</button>
  }
</main>`,styles:[`.restore-test{max-width:760px;margin:40px auto;padding:0 20px;display:block}.restore-test p{line-height:1.5}.restore-test label{display:grid;gap:8px;margin:20px 0}.restore-test input{padding:10px;border:1px solid #aaa;border-radius:6px}.restore-test button{background:#1a73e8;color:white}.restore-test button:disabled{opacity:.5}.restore-test details{margin:12px 0;border:1px solid #ddd;border-radius:6px;padding:12px}.restore-test pre{white-space:pre-wrap;overflow-wrap:anywhere}`]})
export class RestoreTest {
 file?:File; password=''; busy=signal(false); message=signal(''); workspace=signal<Workspace|null>(null);
 constructor(private crypto:CryptoService){}
 chooseFile(event:Event){this.file=(event.target as HTMLInputElement).files?.[0];this.workspace.set(null);this.message.set('')}
 async open(){if(!this.file)return;this.busy.set(true);this.workspace.set(null);this.message.set('');try{const envelope=JSON.parse(await this.file.text()) as Envelope;const workspace=await this.crypto.decrypt(envelope,this.password);if(workspace.schemaVersion!==1||!Array.isArray(workspace.clients))throw Error('Unsupported workspace');this.workspace.set(workspace);this.password=''}catch{this.message.set('Could not decrypt this file. Check the file and master password.');}finally{this.busy.set(false)}}
 clear(){this.workspace.set(null);this.password='';this.message.set('Preview cleared.')}
}
