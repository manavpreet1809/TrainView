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

type CoachingOptions = {
  apiKey: string;
  model: string;
  systemPrompt: string;
  context: string;
  message: string;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

// Keep transport injectable so failures and streams can be verified without paid API calls.
export async function createCoachingResponse(options: CoachingOptions): Promise<Response> {
  const upstream = await (options.fetchImpl ?? fetch)('https://api.openai.com/v1/chat/completions', {
    signal: AbortSignal.any([options.signal, AbortSignal.timeout(options.timeoutMs ?? 30000)]),
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.apiKey}` },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.4,
      stream: true,
      max_completion_tokens: 800,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: `${options.context}\n\nQuestion: ${options.message}` },
      ],
    }),
  });
  if (!upstream.ok || !upstream.body) {
    await upstream.body?.cancel();
    throw new Error('Coaching provider unavailable');
  }
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const parser = new ChatEventParser();
      try {
        while (!parser.done && !cancelled) {
          const { value, done } = await reader.read();
          const text = done ? decoder.decode() : decoder.decode(value, { stream: true });
          for (const content of parser.feed(text, done)) {
            if (!cancelled) controller.enqueue(encoder.encode(content));
          }
          if (done) break;
        }
        if (!parser.done && !cancelled) throw new Error('Incomplete upstream response');
      } catch {
        if (!cancelled) controller.enqueue(encoder.encode('\n\nThe coaching response was interrupted. This answer may be incomplete; please try again.'));
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
        if (!cancelled) controller.close();
      }
    },
    async cancel() {
      cancelled = true;
      await reader.cancel().catch(() => {});
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
