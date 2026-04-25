import cy from "cypress";
import { before, describe, it, beforeEach } from "mocha";

const TEST_USER = {
  name: "E2E Rentals User",
  email: "e2e_rentals@test.com",
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

function login() {
  cy.visit("/login", { failOnStatusCode: false });
  cy.get("input[type='email']").type(TEST_USER.email);
  cy.get("input[type='password']").type(TEST_USER.password);
  cy.get("button[type='submit']").click();
  cy.url().should("include", "/bicycles");
}

describe("Rentals page", () => {
  beforeEach(login);

  it("loads the rentals page without errors", () => {
    cy.visit("/rentals", { failOnStatusCode: false });
    cy.get(".page-title").should("contain", "Rentals");
    cy.get(".alert").should("not.exist");
  });
});
