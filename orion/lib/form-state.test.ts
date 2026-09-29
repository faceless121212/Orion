import { describe, expect, it } from "vitest";

import { fieldsFrom } from "@/lib/form-state";

describe("fieldsFrom", () => {
  it("keeps string fields and drops framework and file entries", () => {
    const formData = new FormData();
    formData.set("name", "Writer");
    formData.set("$ACTION_ID_abc", "");
    formData.set("upload", new Blob(["x"]));

    expect(fieldsFrom(formData)).toEqual({ name: "Writer" });
  });
});
