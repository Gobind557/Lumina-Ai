import { Router } from "express";
import { create, getOne, list, remove, update } from "../controllers/prospect.controller";

export const prospectRoutes = Router();

prospectRoutes.get("/", list);
prospectRoutes.get("/:id", getOne);
prospectRoutes.post("/", create);
prospectRoutes.put("/:id", update);
prospectRoutes.delete("/:id", remove);
