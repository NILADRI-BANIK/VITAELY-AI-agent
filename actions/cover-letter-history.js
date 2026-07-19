"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getCoverLetterHistory({
  search = "",
  sortBy = "newest",
} = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  let orderBy;
  switch (sortBy) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "updated":
      orderBy = { updatedAt: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  // `jobTitle` and `companyName` are NOT real columns on CoverLetter —
  // they only exist inside the `formData` Json field (set by
  // generateCoverLetter/updateCoverLetter in actions/cover-letter.js).
  // Prisma can't run a simple `contains`/`insensitive` text search across
  // a Json blob the way it can on a String column, and even the
  // `string_contains` JSON filter doesn't reliably support
  // case-insensitive matching across Prisma versions/providers. The
  // simplest correct approach: let Prisma filter on `title` (a real
  // String column) at the DB level, then also fetch all of the user's
  // letters and filter in JS against formData.jobTitle/companyName for
  // the parts of the search that need to look inside the JSON blob.
  if (!search) {
    return await db.coverLetter.findMany({
      where: { userId: user.id },
      orderBy,
    });
  }

  const searchLower = search.toLowerCase();

  // Title search can stay a real DB-level query (cheap, indexed-ish via
  // ILIKE under the hood).
  const titleMatches = await db.coverLetter.findMany({
    where: {
      userId: user.id,
      title: { contains: search, mode: "insensitive" },
    },
    orderBy,
  });

  // For jobTitle/companyName, pull the user's remaining letters and
  // filter in JS against formData. This is fine at the scale a single
  // user's cover letter list will realistically reach; if this list
  // ever needs to scale to thousands of rows per user, the formData
  // fields should be promoted to real indexed columns instead.
  const titleMatchIds = new Set(titleMatches.map((c) => c.id));

  const remaining = await db.coverLetter.findMany({
    where: {
      userId: user.id,
      id: { notIn: [...titleMatchIds] },
    },
    orderBy,
  });

  const formDataMatches = remaining.filter((letter) => {
    const formData =
      typeof letter.formData === "object" && letter.formData !== null
        ? letter.formData
        : {};
    const jobTitle = (formData.jobTitle ?? "").toLowerCase();
    const companyName = (formData.companyName ?? "").toLowerCase();
    return jobTitle.includes(searchLower) || companyName.includes(searchLower);
  });

  // Merge and re-sort, since the two queries were fetched separately —
  // need the combined result to respect the requested orderBy.
  const combined = [...titleMatches, ...formDataMatches];

  combined.sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === "updated") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    // newest (default)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return combined;
}
