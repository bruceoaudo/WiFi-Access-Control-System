import { Request, Response, Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";

const router = Router()

router.get('/get-plans', authenticateUser, (req: Request, res: Response) => {

    (async () => {

    })()
    
})