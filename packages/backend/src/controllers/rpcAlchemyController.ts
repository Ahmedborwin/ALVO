import { NextFunction, Request, Response } from "express";
export default (dependencies: any) => {
  const {
    useCases: { rpcAlchemyUsecase },
    Utils: {
      Constants: { ALCHEMY_API_KEY },
    },
  } = dependencies;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = ALCHEMY_API_KEY;
      if (!apiKey)
        return res.status(500).json({
          error: "ALCHEMY_API_KEY is not set",
        });

      const alchemy = await rpcAlchemyUsecase(dependencies);
      const alchemyCreate: any | Error = await alchemy(req);

      if (alchemyCreate instanceof Error)
        throw new Error(alchemyCreate.toString());

      if (alchemyCreate) return res.json(alchemyCreate.data);
      else throw new Error("Try Again");
    } catch (error) {
      next(error);
    }
  };
};
