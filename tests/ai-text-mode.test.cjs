const assert=require('node:assert/strict'),fs=require('node:fs');
// No robotic browser voice anywhere; a denied microphone switches the assistant to typing instead of freezing.
const chat=fs.readFileSync('public/ai-chat.js','utf8'),call=fs.readFileSync('public/call-ai.js','utf8');
for(const [name,src] of [['ai-chat',chat],['call-ai',call]])assert.ok(!/speechSynthesis\.speak|SpeechSynthesisUtterance/.test(src),name+' must not use browser speech synthesis');
assert.ok(chat.includes("mic:'Mikrofonga ruxsat berilmadi. Matnli rejimdan foydalanishingiz mumkin.'"));
assert.ok(chat.includes('data-typed')&&chat.includes("e.name==='NotAllowedError'?textMode(c().mic)"));
assert.ok(/async function listen\(id\)\{if\(!alive\(id\)\)return;if\(typing\)\{textMode\(\);return\}/.test(chat),'text mode never re-opens the microphone');
assert.ok(chat.includes('data-mute'),'sound toggle 🔊/🔇 present');
console.log('PASS AI: natural server voice only, 🔊/🔇 toggle, denied microphone falls back to text mode.');
