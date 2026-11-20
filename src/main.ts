import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component, computed, effect, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CryptoService, Workspace } from './app/core/crypto.service';
import { LocalStorageService } from './app/core/local-storage.service';
import { SyncService } from './app/core/sync.service';
import { AuthService } from './app/core/auth.service';

@Component({
  standalone: true, imports: [FormsModule], selector: 'app-root', template: `
<main [class.locked]="locked()">
  @if (locked()) { <section class="unlock"><div class="brand">Private Notes</div><h1>{{ hasCache ? 'Unlock your workspace' : 'Create your workspace' }}</h1><p>Sign in with Google, then enter your master password. Neither password nor notes leave this browser in plaintext.</p><input [(ngModel)]="password" type="password" autocomplete="current-password" placeholder="Master password" (keyup.enter)="unlock()"><button (click)="unlock()">{{auth.state()==='signed-in' ? (hasCache?'Unlock':'Create workspace') : 'Sign in with Google'}}</button><a class="privacy-link" href="privacy/">Privacy Policy</a><small>{{error()}}</small></section> }
  @else { <aside [class.closed]="sidebarClosed()"><div class="aside-head"><b>Private Notes</b><button class="sidebar-toggle" aria-label="Collapse sidebar" (click)="sidebarClosed.set(!sidebarClosed())"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></div><input aria-label="Search clients" [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Search clients"><button class="new" (click)="createClient()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>New client</button><nav>@for (client of filtered(); track client.id) {<div class="client-row" [class.selected]="selectedId()===client.id" (click)="select(client.id)">@if(renamingId()===client.id){<input #nameInput aria-label="Client name" [ngModel]="client.name" (ngModelChange)="saveName(client.id,$event)" (click)="$event.stopPropagation()" (keydown.enter)="finishRename()" (keydown.escape)="finishRename()" (blur)="finishRename()" autofocus>} @else {<div class="client-copy"><strong>{{client.name}}</strong><span>{{client.content.slice(0,36) || 'No notes yet'}}</span></div>}<div class="row-actions"><button aria-label="Rename {{client.name}}" title="Rename" (click)="rename(client.id,$event)">✎</button><button aria-label="Delete {{client.name}}" title="Delete" (click)="deleteClient(client.id,$event)">⌫</button></div></div>} @empty {<p class="empty">No matching clients</p>}</nav><footer><button (click)="exportBackup()">Export backup</button><button (click)="lock()">Lock</button></footer></aside><section class="editor"><header><button class="mobile-menu" (click)="sidebarClosed.set(false)">☰</button><div>@if (selected()) {<h1>{{selected()!.name}}</h1><span class="status">{{sync.status()}}</span>} @else {<h1>Select a client</h1><span>Choose a client from the sidebar to view or edit notes.</span>}</div></header>@if(selected()){<textarea aria-label="Client notes" [(ngModel)]="selected()!.content" (ngModelChange)="editContent($event)" placeholder="Start typing your notes…"></textarea>} @else {<div class="welcome"><h2>No clients yet</h2><p>Create your first client to start organizing notes.</p></div>}</section>
  }
  @if (deleteCandidate()) { <div class="dialog-backdrop" (click)="cancelDelete()"><section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" (click)="$event.stopPropagation()"><h2 id="delete-title">Delete client?</h2><p><strong>{{deleteCandidate()!.name}}</strong> and all of its notes will be removed from this workspace.</p><div class="form-actions"><button (click)="cancelDelete()">Cancel</button><button class="delete-confirm" (click)="confirmDelete()">Delete</button></div></section></div> }
</main>`, styleUrl: './styles.scss'
})
export class App {
  workspace = signal<Workspace>({ schemaVersion: 1, nextClientId: 1, clients: [] }); locked = signal(true); selectedId = signal<number | null>(null); query = signal(''); password = ''; hasCache = false; error = signal(''); sidebarClosed = signal(false); renamingId = signal<number|null>(null); deletingId = signal<number|null>(null);
  selected = computed(() => this.workspace().clients.find(x => x.id === this.selectedId()));
  deleteCandidate = computed(() => this.workspace().clients.find(x => x.id === this.deletingId()));
  filtered = computed(() => { const q = this.query().toLowerCase().trim(); return [...this.workspace().clients].filter(c => c.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)); });
  constructor(public crypto: CryptoService, public local: LocalStorageService, public sync: SyncService, public auth: AuthService) { this.local.get().then(x => this.hasCache = !!x); effect(() => { if (!this.locked() && this.password) this.sync.queue(this.workspace(), this.password); }); }
  async unlock() { try { if(this.auth.state()!=='signed-in') await this.auth.signIn(); const cached=await this.sync.initialize(); this.workspace.set(cached ? await this.crypto.decrypt(cached, this.password) : this.workspace()); if (!cached) await this.local.save(await this.crypto.encrypt(this.workspace(), this.password)); this.locked.set(false); this.error.set(''); } catch(e) { this.error.set(e instanceof Error && e.message.includes('OAuth') ? e.message : 'Unable to unlock. Check your password, sign-in, and connection.'); } }
  lock() { this.workspace.set({ schemaVersion: 1, nextClientId: 1, clients: [] }); this.password = ''; this.selectedId.set(null); this.locked.set(true); }
  createClient() { const w = structuredClone(this.workspace()), now = new Date().toISOString(); const c = { id: w.nextClientId++, name: 'New client', createdAt: now, updatedAt: now, content: '' }; w.clients.push(c); this.query.set(''); this.sidebarClosed.set(false); this.workspace.set(w); this.selectedId.set(c.id); this.renamingId.set(c.id); }
  select(id: number) { this.selectedId.set(id) } editContent(content: string) { const w = structuredClone(this.workspace()), c = w.clients.find(x => x.id === this.selectedId()); if (c) { c.content = content; c.updatedAt = new Date().toISOString(); this.workspace.set(w) } }
  rename(id:number,event:Event) { event.stopPropagation(); this.renamingId.set(id); }
  finishRename() { this.renamingId.set(null); }
  @HostListener('document:pointerdown', ['$event'])
  finishRenameOnOutsideClick(event: PointerEvent) {
    if (this.renamingId() === null) return;
    const target = event.target;
    if (target instanceof Element && !target.closest('input[aria-label="Client name"]')) this.finishRename();
  }
  saveName(id:number,name:string) { const trimmed=name.trim(); if(!trimmed)return; const w=structuredClone(this.workspace()),c=w.clients.find(x=>x.id===id); if(c){c.name=trimmed;c.updatedAt=new Date().toISOString();this.workspace.set(w)} }
  deleteClient(id:number,event:Event) { event.stopPropagation(); this.deletingId.set(id); }
  cancelDelete() { this.deletingId.set(null); }
  confirmDelete() { const id=this.deletingId(); if(id===null)return; const w=structuredClone(this.workspace()); w.clients=w.clients.filter(x=>x.id!==id); this.workspace.set(w); if(this.selectedId()===id)this.selectedId.set(null); this.cancelDelete(); }
  async exportBackup() { const e = await this.crypto.encrypt(this.workspace(), this.password); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(e)], { type: 'application/json' })); a.download = 'private-notes-backup.enc.json'; a.click(); URL.revokeObjectURL(a.href); }
}
bootstrapApplication(App);
