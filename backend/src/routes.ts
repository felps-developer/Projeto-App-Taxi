import { Router } from "express";
import { RideController } from "./controllers/RideController";
import { ListRideController } from "./controllers/ListRideController";


const router = Router();

router.post('/ride/estimate', RideController.estimate);
router.patch('/ride/confirm', RideController.confirm);
router.get('/ride', new ListRideController().handle);

  

export { router }