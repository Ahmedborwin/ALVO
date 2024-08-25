import { getChain } from "@alchemy/aa-core";
import { NextFunction, Request, Response } from "express";
export default (dependencies: any) => {
  const {
    useCases: { chainAlchemyUsecase },
    Utils: {
      Constants: { ALCHEMY_API_KEY },
    },
  } = dependencies;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = ALCHEMY_API_KEY;
      const id = req.params.id;
      const chain = getChain(parseInt(id));

      if (!apiKey)
        return res.status(500).json({
          error: "ALCHEMY_API_KEY is not set",
        });

      if (!chain)
        return res.status(404).json({ error: `Chain not found: ${id}` });

      const rpcUrl = chain.rpcUrls.alchemy.http[0];

      const alchemyChain = await chainAlchemyUsecase(dependencies);
      const alchemyChainCreate: any | Error = await alchemyChain(req, rpcUrl);

      if (alchemyChainCreate instanceof Error)
        throw new Error(alchemyChainCreate.toString());

      if (alchemyChainCreate) return res.json(alchemyChainCreate.data);
      else throw new Error("Try Again");
    } catch (error) {
      next(error);
    }
  };
};
