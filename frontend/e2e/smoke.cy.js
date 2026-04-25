describe("Smoke", () => {
  it("logs in with admin credentials and redirects to bicycles", () => {
    cy.visit("/login", { failOnStatusCode: false });
    cy.get("input[type='email']").type(Cypress.env("ADMIN_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("ADMIN_PASSWORD"), {
      log: false,
    });
    cy.get("button[type='submit']").click();
    cy.url().should("include", "/bicycles");
  });
});
