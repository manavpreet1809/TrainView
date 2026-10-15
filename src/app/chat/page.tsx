export const dynamic = 'force-dynamic';

import { ChatInterface } from '@/components/chat/chat-interface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  getKeyMetrics,
} from '@/lib/garmin-data';

export default async function ChatPage() {
  const metrics = await getKeyMetrics();

  const weeklyDistanceMetric = metrics.find(
    metric => metric.id === 'weekly-distance',
  );
  const chatContext = { weeklyDistance: weeklyDistanceMetric?.value ?? '--' };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 py-8">
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold">AI Coach</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Ask about pacing, recovery, or training strategy. Recorded training data · Weekly
            distance {' '}
            
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChatInterface context={chatContext} />
        </CardContent>
      </Card>
    </div>
  );
}
