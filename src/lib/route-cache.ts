export class RouteCache<T> {
  private entries = new Map<string,{version:string; value:T}>();
  constructor(private limit = 32) { if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid cache limit'); }
  get(key: string, version: string) {
    const entry=this.entries.get(key);
    if (!entry || entry.version !== version) { this.entries.delete(key); return undefined; }
    this.entries.delete(key); this.entries.set(key,entry); return entry.value;
  }
  set(key:string, version:string, value:T) {
    this.entries.delete(key); this.entries.set(key,{version,value});
    while(this.entries.size>this.limit) this.entries.delete(this.entries.keys().next().value!);
  }
}
