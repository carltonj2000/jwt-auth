const request = require("supertest");
const assert = require("assert");

const app = require("../app");
const auth = require("../auth");

describe("get posts", () => {
  it("should get error without authorization", () =>
    request(app).get("/posts").expect(403));
  it("should get authorized posts only", () =>
    request(auth)
      .post("/login")
      .send({ username: "jeffrey" })
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(200)
          .then((res) => assert(res.body[0].username, "jeffrey"))
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      ));
  it("should get an authorization timeout", () =>
    request(auth)
      .post("/login")
      .send({ username: "carlton" })
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 4000))
      )
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(403)
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      ));
  it("should get an authorization with a refresh token", () =>
    request(auth)
      .post("/login")
      .send({ username: "carlton" })
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 2000))
      )
      .then((res) =>
        request(auth)
          .post("/token")
          .send({ username: "carlton", refreshToken: res.body.refreshToken })
      )
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 2000))
      )
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(200)
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      ));
  it("should get an authorization then a timeout after the token expires", () =>
    request(auth)
      .post("/login")
      .send({ username: "carlton" })
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 2000))
      )
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(200)
          .then(() => res)
      )
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 2000))
      )
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(403)
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      ));
  it("should get an authorization for back to back requests", () =>
    request(auth)
      .post("/login")
      .send({ username: "carlton" })
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(200)
          .then(() => res)
      )
      .then((res) =>
        request(app)
          .get("/posts")
          .set("Authorization", `Bearer ${res.body.accessToken}`)
          .expect(200)
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      ));
  it("should fail to get a refresh token after logout", () =>
    request(auth)
      .post("/login")
      .send({ username: "carlton" })
      .then((res) =>
        request(auth)
          .post("/token")
          .send({ username: "carlton", refreshToken: res.body.refreshToken })
      )
      .then((res) =>
        request(auth)
          .post("/logout")
          .send({ refreshToken: res.body.refreshToken })
          .expect(204)
          .then(() => res)
      )
      .then((res) =>
        request(auth)
          .post("/token")
          .send({ username: "carlton", refreshToken: res.body.refreshToken })
          .expect(403)
      ));
});
