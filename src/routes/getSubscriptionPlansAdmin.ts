import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";

const router = Router()

router.post('/get-plans', authenticateAdmin, (req: Request, res: Response) => {

    (async () => {

    })()
    
})