import axios from "axios";
import { Request } from "express";

const rpcAlchemyUsecase = async (dependencies: any) => {
  const {
    Utils: {
      Constants: { apiUrl, ALCHEMY_API_KEY },
    },
  } = dependencies;

  const rpcAlchemy = async (req: Request) => {
    try {
      const routes = req.params[0].split("/");

      const url = `${apiUrl}/${routes.join("/")}`;

      const response = await axios.post(url, req.body, {
        headers: {
          Authorization: `Bearer ${ALCHEMY_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  return rpcAlchemy;
};

export default rpcAlchemyUsecase;
