import express, { json } from "express";
import "express-async-errors";
import routes from "./frameworks/routes";
import dependencies from "./config/dependencies";
import CronsIntervalReviewConfig from "./config/CronsIntervalReviewConfig";
import CronsIntervalReviewConfigV2 from "./config/CronsIntervalReviewConfigV2";

import path from "path";
import cors from "cors";
const app = express();
const {
  Common: { NotFound, errorhandler },
  Utils: {
    Constants: { PORT },
  },
} = dependencies;
CronsIntervalReviewConfig();
CronsIntervalReviewConfigV2();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(json());
app.use(cors());
app.use("/api", routes(dependencies));

app.all("*", () => {
  throw new NotFound();
});

app.use(errorhandler);

app.listen(PORT, () => {
  console.log("Running on port", PORT);
});

export default app;
