import { format, fromUnixTime, parseISO } from "date-fns";

const convertUnixToDate = (date: number) => format(parseISO(fromUnixTime(date).toISOString()), "MMM d, yyyy");

export { convertUnixToDate };
