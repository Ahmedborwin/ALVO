import fs from "fs";
import path from "path";

export function saveEventsLog(challengeLog: Map<string, any>) {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logPath = path.join(logDir, "events_log.json");
  const logData = JSON.stringify(Object.fromEntries(challengeLog), null, 2);

  fs.writeFileSync(logPath, logData);
}

export function loadEventsLog(): Map<string, any> | null {
  const logPath = path.join(process.cwd(), "logs", "events_log.json");

  if (fs.existsSync(logPath)) {
    const logData = fs.readFileSync(logPath, "utf8");
    const parsedData = JSON.parse(logData);
    return new Map(Object.entries(parsedData));
  }

  return null;
}
