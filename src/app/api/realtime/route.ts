import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-server-session';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.uid;

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'global';

    // Set up SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        const connectionEvent = {
          type: 'connection',
          data: { status: 'connected', channel, userId },
          timestamp: new Date().toISOString()
        };
        
        controller.enqueue(`data: ${JSON.stringify(connectionEvent)}\n\n`);

        // Send periodic heartbeat
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeatEvent = {
              type: 'heartbeat',
              data: { timestamp: new Date().toISOString() },
              timestamp: new Date().toISOString()
            };
            controller.enqueue(`data: ${JSON.stringify(heartbeatEvent)}\n\n`);
          } catch (error) {
            console.error('Error sending heartbeat:', error);
            clearInterval(heartbeatInterval);
            controller.close();
          }
        }, 30000); // Every 30 seconds

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Error in realtime SSE:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}