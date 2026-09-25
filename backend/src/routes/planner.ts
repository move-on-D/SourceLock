import { Router } from 'express';
import { generateStudyPlan } from '../services/plannerService';

export const plannerRouter = Router();

plannerRouter.get('/', (req, res) => {
    try {
        const plan = generateStudyPlan();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate study plan' });
    }
});
