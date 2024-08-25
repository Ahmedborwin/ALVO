import rpcAlchemyController from "./rpcAlchemyController";
import chainController from "./chainController";

export default (dependencies: any) => {
  return {
    rpcAlchemyController: rpcAlchemyController(dependencies),
    chainController: chainController(dependencies),
  };
};
