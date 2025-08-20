import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders and exposes working links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Test internal navigation links
    const internalLinks = [
      { name: /dashboard/i, type: "internal" },
      { name: /document processor/i, type: "internal" },
      { name: /book outliner/i, type: "internal" },
      { name: /analytics/i, type: "internal" },
      { name: /terms of service/i, type: "internal" },
      { name: /privacy policy/i, type: "internal" },
      { name: /about us/i, type: "internal" },
      { name: /help center/i, type: "internal" },
      { name: /support center/i, type: "internal" },
      { name: /contact us/i, type: "internal" },
      { name: /contact support/i, type: "internal" },
    ];

    // Test external links
    const externalLinks = [
      { name: /email support/i, type: "external", href: "mailto:support@doccraft-ai.com" },
      { name: /call us/i, type: "external", href: "tel:+1-555-0123" },
      { name: /email us/i, type: "external", href: "mailto:support@doccraft-ai.com" },
    ];

    // Verify all internal links are present and use React Router
    internalLinks.forEach(({ name }) => {
      const link = screen.getByRole("link", { name });
      expect(link).toBeInTheDocument();
    });

    // Verify all external links are present and have correct href
    externalLinks.forEach(({ name, href }) => {
      const link = screen.getByRole("link", { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    });

    // Verify footer has proper accessibility attributes
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Verify navigation sections have proper aria-labels
    expect(screen.getByRole("navigation", { name: /quick links/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /legal & info/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /contact & support/i })).toBeInTheDocument();
  });

  it("renders without contact button when showContactButton is false", () => {
    render(
      <MemoryRouter>
        <Footer showContactButton={false} />
      </MemoryRouter>
    );

    // Contact buttons should not be present
    expect(screen.queryByRole("link", { name: /contact support/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /email us/i })).not.toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-footer-class";
    render(
      <MemoryRouter>
        <Footer className={customClass} />
      </MemoryRouter>
    );

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass(customClass);
  });
});
