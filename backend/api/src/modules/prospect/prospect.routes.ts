import { Router } from "express";
import { create, getOne, list, remove, update } from "./prospect.controller";

export const prospectRoutes = Router();

prospectRoutes.get("/", list);
prospectRoutes.get("/:id", getOne);
prospectRoutes.post("/", create);
prospectRoutes.patch("/:id", update);
prospectRoutes.delete("/:id", remove);
