import { Router } from "express";
import { create, getOne, list, remove, update } from "../controllers/template.controller";

export const templateRoutes = Router();

templateRoutes.get("/", list);
templateRoutes.get("/:id", getOne);
templateRoutes.post("/", create);
templateRoutes.put("/:id", update);
templateRoutes.delete("/:id", remove);
