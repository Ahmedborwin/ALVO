import express, { Router } from "express";
import alchemyRoutes from "./Alchemy";
import { Main } from "../../config/CronsIntervalReviewConfigV2";

export default (dependencies: any) => {
  const routes: Router = express.Router();
  const alchemy: Router = alchemyRoutes(dependencies);

  routes.use("/rpc", alchemy);
  // not a standard call cause this is temporary and will remove this and we will be setting this as crons i think. if not will work on this by the end.
  routes.get("/stravaCall", Main);//---no be removed in future so not standard set up for this

  return routes;
};
