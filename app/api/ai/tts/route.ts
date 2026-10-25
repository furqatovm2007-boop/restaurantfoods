import { identity } from '../../../access';
import { ApiError, body, failure, json, sameOrigin, text, throttle } from '../../../http';
import { serviceTts } from '../../../ai-voice';
export const dynamic = 'force-dynamic';

/*
 * Natural speech for the assistants and Call AI: POST {text, lang, voice?: 'nova' | 'onyx'} → MP3 (base64).
 * Any signed-in user (Supabase or Telegram session); the OpenAI key stays on the server. When the voice is
 * unavailable the page shows the text instead — the browser's robotic Uzbek voice is not used.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'AI_LOGIN_REQUIRED');
    const b = await body(request);
    const lang = text(b.lang);
    if (!['uz', 'ru', 'en'].includes(lang)) throw new ApiError(400, 'INVALID_REQUEST');
    const say = text(b.text, 1, 1000);
    await throttle('tts:' + u.userId, 80);
    await throttle('tts:global', 600);
    const voice = await serviceTts(say, lang, b.voice === 'onyx' ? 'onyx' : 'nova');
    if (!voice) throw new ApiError(503, 'AI_VOICE_UNAVAILABLE');
    return json(voice);
  } catch (e) {
    return failure(e);
  }
}
