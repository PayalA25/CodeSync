import { Router } from 'express';
import { compiler } from "../controllers/compiler.controllers.js"

const router = Router();

router.route('/compile').post(compiler);

export default router ;