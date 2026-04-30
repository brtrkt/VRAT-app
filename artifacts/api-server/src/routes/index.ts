import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stripeRouter from "./stripe";
import errorReportsRouter from "./error-reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stripeRouter);
router.use(errorReportsRouter);

export default router;
