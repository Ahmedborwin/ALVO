"use client";

import type { NextPage } from "next";
import { useStravaState } from "~~/services/store/store";

const Home: NextPage = () => {
  const { userData } = useStravaState(state => state);
  console.log(userData);

  return <div>Welcome</div>;
};

export default Home;
