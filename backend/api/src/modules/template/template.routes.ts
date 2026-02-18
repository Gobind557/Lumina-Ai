import { Router } from "express";
import { create, getOne, list, remove, update } from "./template.controller";

export const templateRoutes = Router();

templateRoutes.get("/", list);
templateRoutes.get("/:id", getOne);
templateRoutes.post("/", create);
templateRoutes.patch("/:id", update);
templateRoutes.delete("/:id", remove);
