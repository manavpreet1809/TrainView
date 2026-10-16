export class ChatInputError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export async function readChatMessage(request: Request) {
  const reader=request.body?.getReader();
  if (!reader) throw new ChatInputError('Message is required.');
  const decoder=new TextDecoder(); let size=0, text='';
  try {
    while(true) {
      const {done,value}=await reader.read(); if(done) break;
      size+=value.byteLength;
      if(size>16384) { await reader.cancel(); throw new ChatInputError('Request body is too large.',413); }
      text+=decoder.decode(value,{stream:true});
    }
    text+=decoder.decode();
  } finally { reader.releaseLock(); }
  let payload: unknown;
  try { payload=JSON.parse(text); } catch { throw new ChatInputError('Invalid JSON payload.'); }
  if (!payload || typeof payload!=='object' || Array.isArray(payload) || !('message' in payload) || typeof payload.message!=='string') throw new ChatInputError('Message must be a string.');
  const message=payload.message.trim();
  if(!message) throw new ChatInputError('Message is required.');
  if(message.length>4000) throw new ChatInputError('Message must be 4000 characters or fewer.',413);
  return message;
}
