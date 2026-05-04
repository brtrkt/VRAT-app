import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stripeRouter from "./stripe";
import errorReportsRouter from "./error-reports";
import adminDiagnosticsRouter from "./admin-diagnostics";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stripeRouter);
router.use(errorReportsRouter);
router.use(adminDiagnosticsRouter);
router.use(settingsRouter);

export default router;
