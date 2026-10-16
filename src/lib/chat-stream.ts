export class ChatEventParser {
  private buffer='';
  done=false;
  feed(chunk: string, final=false): string[] {
    this.buffer=(this.buffer+chunk).replace(/\r\n/g,'\n');
    if(this.buffer.length>65536) throw new Error('Upstream event too large');
    const events=this.buffer.split('\n\n');
    this.buffer=events.pop() ?? '';
    if(final && this.buffer.trim()) {events.push(this.buffer); this.buffer='';}
    const output: string[]=[];
    for(const event of events) {
      if(this.done) break;
      const data=event.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n');
      if(!data) continue;
      if(data.trim()==='[DONE]') {this.done=true;break;}
      const value=JSON.parse(data);
      if(value.error) throw new Error('Upstream stream error');
      const delta=value.choices?.[0]?.delta;
      const content=delta?.content ?? delta?.refusal;
      if(typeof content==='string') output.push(content);
    }
    return output;
  }
}
