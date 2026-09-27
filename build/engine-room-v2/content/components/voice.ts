import type { Component } from '../schema';

export const component: Component = {
  id: 'voice',
  name: 'Voice',
  box: 'none',
  status: 'Optional, needs setup. The hook, the handler, the [[voice server]] module, and the pronunciation stages all ship, but nothing is spoken until Pulse is running and you have supplied a voice provider key and a voice id. Push and chat channels each need their own configuration on top.',
  summary: 'The assistant reads one line of its answer out loud, so you can walk away from the screen and still know when it finished.',
  purpose:
    'Long work means staring at a terminal waiting for it to stop. A spoken line closes the feedback edge: the system tells you it advanced, and you do not have to watch to find out.',
  who: 'lifeos',
  trigger:
    'hooks/VoiceCompletion.hook.ts runs on Stop, at the end of every assistant [[turn]]. It reads the [[transcript]] and looks for the speaking-icon line in the response. A separate path fires mid-run: a [[skill]] or [[workflow]] posts to the notification endpoint itself when it starts significant work.',
  input:
    'The response text, plus the voice id and display name from configuration. For the routing layer: the event type and how long the task took.',
  output:
    'Spoken audio through the text-to-speech provider. One appended line in the voice event log. Optionally a phone push or a chat message, when the routing table says the event deserves one.',
  files: [
    { path: 'hooks/VoiceCompletion.hook.ts', mode: 'exec', note: 'extracts the spoken line from the response at Stop' },
    { path: 'hooks/handlers/VoiceNotification.ts', mode: 'exec', note: 'the handler the hook delegates to' },
    { path: 'LIFEOS/PULSE/VoiceServer/voice.ts', mode: 'exec', note: 'the module inside Pulse that calls the provider' },
    { path: 'LIFEOS/PULSE/lib/homographs.ts', mode: 'read', note: 'respells words the provider reads with the wrong sense' },
    { path: 'LIFEOS/USER/PRINCIPAL/PRONUNCIATIONS.json', mode: 'read', note: 'your own literal term-to-sound map' },
    { path: 'LIFEOS/MEMORY/VOICE/voice-events.jsonl', mode: 'write', note: 'every spoken event, one line each' },
    { path: 'hooks/lib/notifications.ts', mode: 'exec', note: 'the routing layer for push and chat channels' },
    { path: 'settings.json', mode: 'read', note: 'the voice id mirror and the notification routing table' },
  ],
  how: `The path is short. hooks/VoiceCompletion.hook.ts fires on Stop, parses the [[transcript]], and pulls out the one line the assistant marked as speakable. Its header notes a gate that matters: only a main terminal [[session]] speaks. A [[subagent]] never does, so ten agents finishing at once do not produce ten voices talking over each other. If the response carries no speakable line, the hook falls back to a summary line, then to the first sentence, and gives up rather than reading a wall of text.

The line then goes to the notification endpoint that Pulse serves, and Pulse hands it to the provider. Two transforms run first, and LIFEOS/DOCUMENTATION/Notifications/NotificationSystem.md explains why. One applies your own literal pronunciation map. The other fixes words the provider guesses wrong from context. The example given is "live", where "the site is live" would otherwise be read as the verb in "where you live", and the fix respells only the occurrences that match the broadcast sense rather than replacing the word everywhere.

Above that sits a routing table in settings.json that decides who hears about what. An ordinary completion is voice only. A task over five minutes, or a background agent finishing, adds a phone push. A security alert adds a chat channel too. Every dispatch is fire and forget with a short timeout, so a dead channel never blocks the run. One rule is worth remembering: scheduled jobs never speak, because a daemon that talks at three in the morning is a bug, not a feature.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Notifications/NotificationSystem.md',
    'hooks/VoiceCompletion.hook.ts:L1-L25',
    'LIFEOS/DOCUMENTATION/Pulse/PulseSystem.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    {
      name: 'A terminal bell or a desktop notification',
      tradeoff:
        'Free, instant, and works with no service at all. Carries one bit of information: something happened. You still have to go and look to find out what, which is exactly the trip the spoken line saves.',
    },
    {
      name: 'The operating system\'s built-in speech',
      tradeoff:
        'Wins by costing nothing per word and working offline. Costs quality badly enough that you stop listening, and gives you no choice of voice, which for a system meant to feel like yours is most of the point.',
    },
    {
      name: 'Push notifications only',
      tradeoff:
        'Reaches you anywhere, and keeps a written record you can read later. Costs your attention in the wrong direction, because it puts you back on the phone, and a notification that arrives while you are already at the desk is noise.',
    },
  ],
  why:
    'The design bet is that the useful signal is one sentence, not an alert. Because the [[model]] writes that sentence as part of its answer, the hook only has to find and forward it, so nothing has to summarise anything twice. The costs are honest ones. Every spoken line is a paid API call to an outside provider, which means the text of your completion lines leaves the machine, so the routing rules are deliberately narrow. And the whole thing rides on Pulse: when the daemon is down the system simply goes quiet, and silence is indistinguishable from having nothing to say.',
  examples: [
    {
      field: 'distribution',
      text:
        'The warehouse does not put a screen on the forklift. A pick that completes normally says one line over the headset and nothing else. A pick that fails, or a cold-chain door left open past its threshold, escalates to the supervisor\'s phone as well. The night shift is deliberately excluded from the spoken channel, because an automated voice in an empty building is only ever startling.',
    },
    {
      field: 'school',
      text:
        'A school does not ring the bell for everything. The end of a lesson is one short announcement everyone hears in passing. A fire alarm is a different channel entirely and reaches the whole site. Routine internal messages never go over the speakers at all, because a public address system that talks constantly is one nobody listens to.',
    },
  ],
  related: ['pulse', 'observability', 'hooks', 'hermes'],
  without:
    'Without this: you have to watch the terminal to know when a long run finished, and a background job that completed an hour ago tells you nothing until you look.',
  failure:
    'Long runs finish in silence when you expected to hear them, and the voice event log has no new lines even though the sessions clearly ended.',
};
