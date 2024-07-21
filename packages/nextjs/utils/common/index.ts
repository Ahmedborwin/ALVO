import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { ERC_TOKEN_URL } from "~~/constants";

const convertUnixToDate = (date: number) => format(parseISO(fromUnixTime(date).toISOString()), "MMM d, yyyy");

const getERCTokenDetails = async () => {
  const { data } = await axios.get(ERC_TOKEN_URL);
  return data.tokens;
};

export { convertUnixToDate, getERCTokenDetails };
