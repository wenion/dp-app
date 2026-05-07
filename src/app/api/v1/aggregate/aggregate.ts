import { RawTrace } from "@/types/raw-trace";

const CODES = new Set([
  "Backspace",
  "Delete",
  "Enter",
  "Space",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Period",
  "Minus",
  "Equal",
  null,
]);

export function aggregateMutationEvents(traces: RawTrace[], lastTraces: RawTrace[]): RawTrace[] {
  const results: RawTrace[] = [];
  let prev = lastTraces[0];

  for (let i = 0; i < traces.length; i++) {
    const current = traces[i];
    const next = traces[i + 1];

    if (current.source === "Mutation") {
      if (current.tag === "USER-QUERY") { // Gemini user_query
        if (current.name?.includes("undefined")) {
          if (prev && prev.source === "Mutation" && prev.tag === "MODEL-RESPONSE") {
            results.pop();
          }
          // skip invalid user query
          continue;
        }
      }
      else if (current.tag === "MODEL-RESPONSE") {  // Gemini ai_response
      }
      else if (current.tag === "SECTION") { // ChatGPT section
        if (prev && prev.tag === "SECTION" && prev.session_id === current.session_id) {
          results.pop();
        }
      }
      else if (current.tag === "DIV") {
        if (prev && prev.tag === "DIV") {
          const prevMessage = prev.message?.slice(0, 10);
          if (prevMessage && current.message?.startsWith(prevMessage)) {
            results.pop();
          }
        }
      }
    }
    else if (current.event_type === "keystroke") {
      if (current.key === "Enter" && next && next.event_type === "mutation" && next.author ==="AI") {
        continue;
      }
      else if (current.element_type === "spellcheck") {
        current.author = "editor";

        let reqId = current.event_id?.split("_")[0];
        let last = results.length > 0 ? results[results.length - 1] : null;
        let j = 0;
        while (last && last.event_type === "keystroke" && reqId === last.event_id?.split("_")[0]) {
          last.author = "editor";
          last = results[results.length - 1 - j];
          j++;
        }
      }
    }
    else if (current.event_type === "keydown" || current.event_type === "input") {
      continue;
    }

    results.push(current);
    prev = current;
  }
  return results;
}
