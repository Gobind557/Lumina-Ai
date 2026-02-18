import request from "supertest";
import { app } from "../src/app/app";

describe("auth", () => {
  it("signs up and logs in", async () => {
    const email = `test_${Date.now()}@example.com`;
    const password = "Password123!";

    const signup = await request(app).post("/api/auth/signup").send({
      email,
      password,
      first_name: "Test",
      last_name: "User",
    });

    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeTruthy();

    const login = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});
