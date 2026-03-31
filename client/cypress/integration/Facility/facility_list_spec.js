/// <reference types="Cypress" />

describe("Facility List Spec", () => {
  const FRONTEND_URL = Cypress.env("FRONT_END_URL");

  it("Navigates to facility list page", () => {
    cy.visit(`${FRONTEND_URL}/facilities`);
  });

  it("Shows the redesigned facility directory layout", () => {
    cy.contains("National Facility Registry").should("be.visible");
    cy.contains("Filter Registry").should("be.visible");
    cy.get("[data-test=advanced_search_container]").should("be.visible");
    cy.get("[data-test=advanced_search_container] [role=tab]").should(
      "have.length",
      4
    );
    cy.contains("Regulatory Status").should("be.visible");
    cy.contains("Last Updated").should("be.visible");
    cy.get("[data-test=facilityDirectorySearch]").should("be.visible");
    cy.get("[data-test=facilityDirectoryGrid]").should("be.visible");
    cy.get("[data-test=facilityDirectoryCard]")
      .its("length")
      .should("be.gte", 1)
      .and("be.lte", 4);
  });

  it("Shows valid facility data inside a directory card", () => {
    cy.fetch_facilieties_list().then(res => {
      const facility = res[0];

      cy.get("[data-test=facilityDirectoryCard]")
        .first()
        .should("contain", facility.code)
        .and("contain", facility.name)
        .and("contain", facility.district)
        .and("contain", facility.ownership)
        .and("contain", facility.type);

      if (facility.regulatoryStatus) {
        cy.get("[data-test=facilityDirectoryCard]")
          .first()
          .should("contain", facility.regulatoryStatus);
      }
    });
  });
});
