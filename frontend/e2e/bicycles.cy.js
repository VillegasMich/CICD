import cy from "cypress";
import { before, describe, it, beforeEach } from "mocha";

const TEST_USER = {
  name: "E2E Bicycles User",
  email: "e2e_bicycles@test.com",
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

describe("Bicycle listing", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/v1/bicycles").as("getBicycles");
    login();
    cy.wait("@getBicycles");
  });

  it("displays at least one bicycle in the list", () => {
    cy.get(".bicycle-table tbody tr").should("have.length.greaterThan", 0);
  });

  it("navigates to the bicycle detail page when clicking View", () => {
    cy.get(".bicycle-table tbody a#view-link").contains("View").click();
    cy.url().should("match", /\/bicycles\/\d+/);
  });
});
