import pkg from "node-uuid";
const { v4 } = pkg;
import { createLogger, addColors, format, transports } from "winston";  
const { combine, timestamp, label, printf, colorize, splat } = format;
// console.log(`Logging all modules at ${logDirectory}`);
const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    verbose: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "magenta",
    verbose: "yellow",
    info: "green",
    debug: "cyan",
  },
};
 
const myFormat = printf(
  ({ level, message, label, timestamp, file, line, uuid }) => {
    return `${timestamp} [${label}:${uuid}] ${level}: ${message}`;
  }
);
 
let logger_settings = {
  levels: myCustomLevels.levels,
  format: combine(
    colorize({ all: true }),
    label({ label: "MakeMyDay" }),
    timestamp(),
    splat(),
    myFormat
  ),
  defaultMeta: { Resource: "MakeMyDay" },
  transports: [
    new transports.Console()
  ],
};
 
addColors(myCustomLevels.colors);
export const Logger = (uuid = v4()) =>
  createLogger({
    level: "debug",
    ...logger_settings,
    format: format.combine(
      format((info) => {
        info.uuid = uuid;
        return info;
      })(),
      logger_settings.format
    ),
  });
