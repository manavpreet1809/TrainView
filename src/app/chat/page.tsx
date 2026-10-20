export const dynamic = 'force-dynamic';

import { getDataConfig } from '@/lib/data-config';
import { ChatInterface } from '@/components/chat/chat-interface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  getKeyMetrics,
} from '@/lib/garmin-data';

export default async function ChatPage() {
  const config = getDataConfig();
  const metrics = await getKeyMetrics();

  const weeklyDistanceMetric = metrics.find(
    metric => metric.id === 'weekly-distance',
  );
  const chatContext = { weeklyDistance: weeklyDistanceMetric?.value ?? '--' };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4">
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold">AI Coach</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {config.coachingMode === 'demo' ? 'Demo mode: replies explain the sample data. Live AI is disabled.' : config.coachingMode === 'live' ? 'Live coaching is configured. Your question and training summary go to OpenAI; GPS routes do not. Responses can be inaccurate.' : 'Live coaching is not configured. Replies show your recorded training summary without generating advice.'}
            {' '}Distance in the last 7 days: {chatContext.weeklyDistance}.
            
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChatInterface context={chatContext} />
        </CardContent>
      </Card>
    </div>
  );
}
