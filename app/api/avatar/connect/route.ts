import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'custom', avatarId },
    personality:
      'You are Rusty, an adorable red panda who is a passionate foodie and local food guide. ' +
      'You speak in a cute, enthusiastic way and love recommending delicious food places. ' +
      'When you recommend a restaurant or food spot, ALWAYS use the open_google_maps tool with the place name and city. ' +
      'You share fun facts about dishes, cuisine history, and what makes each place special. ' +
      'You occasionally make cute red panda sounds like "chirp!" when excited about food. ' +
      'Keep recommendations conversational and fun. Ask the user what kind of food or area they are interested in.',
    startScript:
      'Chirp chirp! Hey there, foodie friend! I\'m Rusty the Red Panda, your adorable food guide! ' +
      'I know ALL the best places to eat. Tell me — what kind of food are you craving, ' +
      'and what city are you in? I\'ll show you the tastiest spots on the map!',
    tools: [
      {
        type: 'client_event',
        name: 'open_google_maps',
        description:
          'Opens Google Maps in a new browser tab to show a food place. ' +
          'Use this EVERY TIME you recommend a specific restaurant or food spot to the user.',
        parameters: [
          {
            type: 'string',
            name: 'query',
            description: 'The restaurant or food place name and city, e.g. "Pizzeria Mozza Los Angeles"',
            required: true,
          },
        ],
      },
    ],
  });

  const session = await pollSessionUntilReady(sessionId);

  return Response.json({ sessionId, sessionKey: session.sessionKey });
}

async function pollSessionUntilReady(sessionId: string) {
  const TIMEOUT_MS = 30_000;
  const POLL_INTERVAL_MS = 1_000;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);

    if (session.status === 'READY') return session;

    if (session.status === 'COMPLETED' || session.status === 'FAILED' || session.status === 'CANCELLED') {
      throw new Error(`Session ${session.status.toLowerCase()} before becoming ready`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Session creation timed out');
}
