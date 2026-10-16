import test from 'node:test';
import assert from 'node:assert/strict';
import { readChatMessage } from '../src/lib/chat-request.ts';
const request=value=>new Request('http://localhost/api/chat',{method:'POST',body:JSON.stringify(value)});
test('chat validates shape and trims a bounded message',async()=>{
 assert.equal(await readChatMessage(request({message:' hi '})),'hi');
 for(const value of [null,[],{}, {message:4},{message:' '}]) await assert.rejects(readChatMessage(request(value)));
 await assert.rejects(readChatMessage(request({message:'x'.repeat(4001)})),error=>error.status===413);
 await assert.rejects(readChatMessage(request({message:'x',padding:'x'.repeat(17000)})),error=>error.status===413);
});
