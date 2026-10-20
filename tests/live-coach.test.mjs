import test from 'node:test';
import assert from 'node:assert/strict';
import { createCoachingResponse } from '../src/lib/chat-stream.ts';

const encoder = new TextEncoder();
const event = text => 'data: ' + JSON.stringify({ choices: [{ delta: { content: text } }] }) + '\n\n';
const options = overrides => ({
  apiKey: 'test-only-key',
  model: 'gpt-4o-mini',
  systemPrompt: 'Use only recorded data.',
  context: 'Recorded distance: 12 km.',
  message: 'Summarize my workouts.',
  signal: new AbortController().signal,
  ...overrides,
});

test('live transport sends bounded requests and preserves fragmented UTF-8 streams', async () => {
  let received;
  const source = encoder.encode(event('Recorded distance: 12 km 🌍') + 'data: [DONE]\n\n');
  const response = await createCoachingResponse(options({
    fetchImpl: async (url, init) => {
      received = { url, init };
      return new Response(new ReadableStream({
        start(controller) {
          for (let i = 0; i < source.length; i += 3) controller.enqueue(source.slice(i, i + 3));
          controller.close();
        },
      }));
    },
  }));
  assert.equal(received.url, 'https://api.openai.com/v1/chat/completions');
  assert.equal(received.init.headers.Authorization, 'Bearer test-only-key');
  const body = JSON.parse(received.init.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.max_completion_tokens, 800);
  assert.equal(body.stream, true);
  assert.equal(body.messages[1].content, 'Recorded distance: 12 km.\n\nQuestion: Summarize my workouts.');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(await response.text(), 'Recorded distance: 12 km 🌍');
});

test('provider rejection cancels its body and never exposes provider diagnostics', async () => {
  let cancelled = false;
  await assert.rejects(createCoachingResponse(options({
    fetchImpl: async () => new Response(new ReadableStream({ cancel() { cancelled = true; } }), { status: 429 }),
  })), /Coaching provider unavailable/);
  assert.equal(cancelled, true);
});

test('incomplete and corrupt provider streams preserve partial text and disclose interruption', async () => {
  for (const ending of ['', 'data: not-json\n\n']) {
    const response = await createCoachingResponse(options({
      fetchImpl: async () => new Response(event('Partial answer.') + ending),
    }));
    const text = await response.text();
    assert.match(text, /^Partial answer\./);
    assert.match(text, /answer may be incomplete/);
    assert.doesNotMatch(text, /test-only-key|not-json/);
  }
});

test('cancelling the response cancels the upstream stream', async () => {
  let cancelled = false;
  const response = await createCoachingResponse(options({
    fetchImpl: async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(encoder.encode(event('First chunk.'))); },
      cancel() { cancelled = true; },
    })),
  }));
  const reader = response.body.getReader();
  await reader.read();
  await reader.cancel();
  assert.equal(cancelled, true);
});

test('request cancellation and timeout reach the provider fetch', async () => {
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(createCoachingResponse(options({
    signal: aborted.signal,
    fetchImpl: async (_url, init) => { init.signal.throwIfAborted(); },
  })), { name: 'AbortError' });
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(createCoachingResponse(options({
      timeoutMs: 10,
      fetchImpl: async (_url, init) => new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
      }),
    })), { name: 'TimeoutError' });
  } finally { clearTimeout(keepAlive); }
});
