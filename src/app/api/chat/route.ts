import { createCoachingResponse } from '@/lib/chat-stream';
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
    return await createCoachingResponse({
      apiKey,
      model: getDataConfig().coachingModel,
      systemPrompt: SYSTEM_PROMPT,
      context,
      message: userMessage,
      signal: request.signal,
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
