import { ChatEventParser } from '@/lib/chat-stream';
import { readChatMessage, ChatInputError } from '@/lib/chat-request';
import { getDataConfig } from '@/lib/data-config';
import { NextResponse } from 'next/server';
import {
  getKeyMetrics,
  getRecentWorkouts,
  getTrainingFocus,
} from '@/lib/garmin-data';

const SYSTEM_PROMPT = `You are TrainView AI, an expert endurance coach who personalises guidance using Garmin Connect metrics. Use the provided context only. Discuss recorded load and heart-rate zones only when available. Readiness, HRV, resting heart rate, sleep, and race goals are unavailable. Do not invent measurements or goals.`;

export async function POST(request: Request) {
  let userMessage: string;
  try { userMessage = await readChatMessage(request); }
  catch (error) {
    return NextResponse.json({ error: error instanceof ChatInputError ? error.message : 'Unable to read request.' }, { status: error instanceof ChatInputError ? error.status : 400 });
  }

  if (getDataConfig().demo) {
    return new NextResponse('TrainView demo: these workouts are synthetic. Explore the dashboard, workout details, and fictional route. Live AI coaching is disabled in demo mode.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
  const context = await buildContextSummary();

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return new NextResponse(fallbackReply(context, userMessage), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `${context}\n\nQuestion: ${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      await response.body?.cancel();
      console.warn('[chat] Upstream request failed with status', response.status);
      return new NextResponse(fallbackReply(context, userMessage), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const parser = new ChatEventParser();
        try {
          while (!parser.done && !cancelled) {
            const { value, done } = await reader.read();
            const text = done ? decoder.decode() : decoder.decode(value, { stream: true });
            for (const content of parser.feed(text, done)) controller.enqueue(encoder.encode(content));
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
      async cancel() { cancelled = true; await reader.cancel().catch(() => {}); },
    });

    return new NextResponse(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    console.warn('[chat] Upstream request unavailable or timed out');
    return new NextResponse(fallbackReply(context, userMessage), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
}

async function buildContextSummary() {
  const [metrics, workouts, focus] = await Promise.all([
    getKeyMetrics(),
    getRecentWorkouts(3),
    getTrainingFocus(),
  ]);

  const metricsText = metrics
    .map(
      metric => `- ${metric.label}: ${metric.value} (${metric.delta})`,
    )
    .join('\n');

  const workoutText = workouts
    .map(workout => {
      const date = new Date(workout.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      return `- ${date} · ${workout.title} (${workout.distanceKm.toFixed(1)} km, load ${workout.trainingLoad})`;
    })
    .join('\n');

  const focusText = focus
    .map(entry => `- ${entry.title}: ${entry.description}`)
    .join('\n');

  return `Garmin data context\nKey metrics:\n${metricsText}\n\nRecent sessions:\n${workoutText}\n\nFocus areas:\n${focusText}\n\nReadiness, sleep, HRV, and race goals: unavailable. Missing numeric load and intensity fields contribute zero to totals.`;
}

function fallbackReply(context: string, question: string) {
  return `Live coaching is unavailable or not configured.\n\nBased on current Garmin context:\n${context}\n\nNo personalized recommendation was generated. Question asked: "${question}".`;
}
