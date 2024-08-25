import express, { Router } from "express";
import { param } from "express-validator";
import controllers from "../../controllers";
export default (dependencies: any) => {
  const { rpcAlchemyController, chainController } = controllers(dependencies);
  const {
    Common: { requestValidationerr },
  } = dependencies;
  const router: Router = express.Router();
  router.post("/alchemy/*", rpcAlchemyController);

  router.post(
    "/chain/:id",
    [param("id").notEmpty().withMessage("Please Make Sure Param is not Empty")],
    requestValidationerr,
    chainController
  );

  return router;
};
