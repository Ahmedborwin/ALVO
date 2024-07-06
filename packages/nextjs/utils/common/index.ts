import { format, fromUnixTime, parseISO } from "date-fns";

const convertUnixToData = (date: number) => format(parseISO(fromUnixTime(date).toISOString()), "MMM d, yyyy");

export { convertUnixToData };
