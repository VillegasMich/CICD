import cy from "cypress";
import { before, describe, it } from "mocha";

const TEST_USER = {
  name: "E2E User",
  email: "e2e_auth@test.com",
  password: "test1234",
};

before(() => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("API_URL")}/api/v1/auth/register`,
    body: TEST_USER,
    failOnStatusCode: false,
  });
});

describe("Authentication", () => {
  it("logs in with valid credentials and redirects to bicycles", () => {
    cy.visit("/login", { failOnStatusCode: false });
    cy.get("input[type='email']").type(TEST_USER.email);
    cy.get("input[type='password']").type(TEST_USER.password);
    cy.get("button[type='submit']").click();
    cy.url().should("include", "/bicycles");
  });

  it("shows an error and stays on login page with wrong password", () => {
    cy.visit("/login", { failOnStatusCode: false });
    cy.get("input[type='email']").type(TEST_USER.email);
    cy.get("input[type='password']").type("wrongpassword");
    cy.get("button[type='submit']").click();
    cy.get(".alert").should("be.visible");
    cy.url().should("include", "/login");
  });
});
