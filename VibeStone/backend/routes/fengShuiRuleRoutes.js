import express from "express";
import { addRule, listRules, updateRule, removeRule } from "../controllers/fengShuiRuleController.js";

const fengShuiRuleRouter = express.Router();

fengShuiRuleRouter.post("/", addRule);
fengShuiRuleRouter.get("/", listRules);
fengShuiRuleRouter.put("/:id", updateRule);
fengShuiRuleRouter.delete("/:id", removeRule);

export default fengShuiRuleRouter;
