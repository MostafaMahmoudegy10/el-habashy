import { beforeEach, describe, expect, it } from "vitest";
import { readPublicContentCache, updatePublicContentCache } from "./publicContentCache";

const CACHE_KEY = "elhabashy:public-content:v1";

describe("public content cache", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("drops an older cache that may contain seeded listings", () => {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({
      version: 1,
      savedAt: Date.now(),
      data: {
        listings: [{ id: 1, slug: "new-cairo-private-villa" }],
      },
    }));

    expect(readPublicContentCache()).toEqual({});
    expect(window.localStorage.getItem(CACHE_KEY)).toBeNull();
  });

  it("keeps an empty API listing result as the source of truth", () => {
    updatePublicContentCache({ listings: [] });

    expect(readPublicContentCache()).toEqual({ listings: [] });
  });
});
