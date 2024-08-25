import axios from "axios";
import { Request } from "express";

const chainAlchemyUsecase = async (dependencies: any) => {
  const {
    Utils: {
      Constants: { ALCHEMY_API_KEY },
    },
  } = dependencies;

  const chainAlchemy = async (req: Request, rpcUrl: string) => {
    try {
      const response = await axios.post(
        `${rpcUrl}/${ALCHEMY_API_KEY}`,
        req.body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  return chainAlchemy;
};

export default chainAlchemyUsecase;
