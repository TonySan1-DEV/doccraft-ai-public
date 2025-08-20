import { describe, it, expect } from "vitest";
import { CHILDRENS_SUBTYPES, CHILDRENS_GENRE_KEY } from "../../src/constants/genreConstants";

describe("Children's genre constants", () => {
  it("exposes the three subtypes", () => {
    expect(CHILDRENS_SUBTYPES).toEqual([
      "children-early",
      "children-middle",
      "children-older",
    ]);
  });

  it("has the correct genre key", () => {
    expect(CHILDRENS_GENRE_KEY).toBe("children");
  });

  it("has the correct number of subtypes", () => {
    expect(CHILDRENS_SUBTYPES).toHaveLength(3);
  });

  it("each subtype follows the expected naming pattern", () => {
    CHILDRENS_SUBTYPES.forEach(subtype => {
      expect(subtype).toMatch(/^children-(\w+)$/);
    });
  });
});
