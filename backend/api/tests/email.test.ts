import request from "supertest";
import { app } from "../src/app";

jest.mock("../src/queues/email.queue", () => ({
  enqueueEmailSend: jest.fn().mockResolvedValue(undefined),
}));

describe("emails", () => {
  it("creates draft and sends email", async () => {
    const email = `test_${Date.now()}@example.com`;
    const password = "Password123!";

    const signup = await request(app).post("/api/auth/signup").send({
      email,
      password,
    });

    const token = signup.body.token as string;

    const prospect = await request(app)
      .post("/api/prospects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "prospect@example.com",
        first_name: "Prospect",
        last_name: "User",
        company: "Example Inc",
      });

    const draft = await request(app)
      .post("/api/emails/draft")
      .set("Authorization", `Bearer ${token}`)
      .send({
        prospect_id: prospect.body.id,
        subject: "Hello",
        body_html: "<p>Hello there</p>",
        body_text: "Hello there",
      });

    expect(draft.status).toBe(200);

    const send = await request(app)
      .post("/api/emails/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        draft_id: draft.body.id,
        idempotency_key: "00000000-0000-0000-0000-000000000001",
        from_email: "sender@example.com",
        to_email: "prospect@example.com",
      });

    expect(send.status).toBe(201);
    expect(send.body.status).toBe("PENDING_SEND");
  });
});
