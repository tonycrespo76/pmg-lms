import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

const voiceStudioUrl = process.env.VOICESTUDIO_URL || "http://127.0.0.1:3900";
const voiceStudioApiKey = process.env.VOICESTUDIO_API_KEY;
const voice = process.env.VOICESTUDIO_VOICE || "The Teacher";
const model = process.env.VOICESTUDIO_MODEL || "omnivoice";
const moduleFilter = option("module");
const languageFilter = option("language");

const headers = voiceStudioApiKey
  ? { Authorization: `Bearer ${voiceStudioApiKey}` }
  : {};

async function voiceStudioRequest(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`VoiceStudio request failed (${response.status}): ${body}`);
  }
  return response;
}

async function validateVoice() {
  const response = await voiceStudioRequest(`${voiceStudioUrl}/v1/audio/voices`, {
    headers,
  });
  const { voices = [] } = await response.json();
  const normalizedVoice = voice.trim().toLocaleLowerCase();
  const match = voices.find((candidate) =>
    candidate.voice_id === voice ||
    candidate.id === voice ||
    candidate.name?.trim().toLocaleLowerCase() === normalizedVoice
  );

  if (!match) {
    const available = voices
      .filter((candidate) => candidate.type === "profile")
      .map((candidate) => candidate.name)
      .filter(Boolean);
    throw new Error(
      `Voice "${voice}" was not found in VoiceStudio. Available profiles: ${available.join(", ") || "none"}`
    );
  }

  return match.voice_id || match.id || voice;
}

function lessonNumber(value) {
  return String(value).padStart(2, "0");
}

function parseLessons(transcript) {
  const blocks = transcript.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return blocks.flatMap((block) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const heading = lines[0];
    if (!heading || !/^(INTRO|SCENE \d+|REVIEW)$/.test(heading)) return [];
    const content = lines.slice(1).join(" ").trim();
    return content ? [{ heading, content }] : [];
  });
}

async function generateLesson({ language, moduleNumber, lessonNumberValue, text, voiceId }) {
  const response = await voiceStudioRequest(`${voiceStudioUrl}/v1/audio/speech`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice: voiceId,
      response_format: "mp3",
    }),
  });
  const audio = Buffer.from(await response.arrayBuffer());
  const directory = path.join(
    ROOT,
    "public",
    "audio",
    language === "es" ? "es" : "",
  );
  await fs.mkdir(directory, { recursive: true });
  const filename = `pmg_module_${moduleNumber}_${lessonNumberValue}.mp3`;
  await fs.writeFile(path.join(directory, filename), audio);
  return filename;
}

const languages = languageFilter ? [languageFilter] : ["en", "es"];
if (languages.some((language) => !["en", "es"].includes(language))) {
  throw new Error("--language must be en or es");
}

const voiceId = await validateVoice();
const moduleIds = moduleFilter
  ? [Number(moduleFilter)]
  : Array.from({ length: 23 }, (_, index) => index + 1);

for (const moduleId of moduleIds) {
  if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 23) {
    throw new Error("--module must be a number from 1 to 23");
  }
  const moduleNumber = lessonNumber(moduleId);

  for (const language of languages) {
    const directory = path.join(ROOT, "public", "transcripts", language === "es" ? "es" : "");
    const filename = `PMG_${moduleNumber}_${language.toUpperCase()}_transcript.txt`;
    const transcript = await fs.readFile(path.join(directory, filename), "utf8");
    const lessons = parseLessons(transcript);

    for (const [index, lesson] of lessons.entries()) {
      const lessonNumberValue = lessonNumber(index + 1);
      const generated = await generateLesson({
        language,
        moduleNumber,
        lessonNumberValue,
        text: lesson.content,
        voiceId,
      });
      console.log(`Generated ${generated} with "${voice}" (${lesson.heading})`);
    }
  }
}
