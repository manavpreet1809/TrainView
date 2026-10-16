import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatEventParser } from '../src/lib/chat-stream.ts';
const event=text=>'data: '+JSON.stringify({choices:[{delta:{content:text}}]})+'\r\n\r\n';
test('stream parser preserves fragmented content and stops at DONE',()=>{
 const parser=new ChatEventParser(); const source=event('hello 🌍')+'data: [DONE]\n\n'+event('ignored');
 const output=[]; for(const char of source) output.push(...parser.feed(char));
 assert.equal(output.join(''),'hello 🌍'); assert.equal(parser.done,true);
});
test('stream parser handles final event, ignores comments, and fails on corrupt upstream data',()=>{
 const parser=new ChatEventParser(); assert.deepEqual(parser.feed(':keepalive\n\n'),[]);
 assert.deepEqual(parser.feed(event('last').trim(),true),['last']);
 assert.throws(()=>parser.feed('data: broken\n\n'));
 assert.throws(()=>new ChatEventParser().feed('x'.repeat(65537)));
});
