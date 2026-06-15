import { getStore } from "@netlify/blobs";

const STORE_NAME = "tcc-posts";

export default async (req) => {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const method = req.method;

  // GET — buscar todos os posts
  if (method === "GET") {
    try {
      const data = await store.get("posts", { type: "json" });
      return Response.json(data || []);
    } catch {
      return Response.json([]);
    }
  }

  // POST — guardar todos os posts (substituir)
  if (method === "POST") {
    try {
      const posts = await req.json();
      // Não sobrescreve com lista vazia por segurança
      if (!Array.isArray(posts) || posts.length === 0) {
        const existing = await store.get("posts", { type: "json" });
        if (existing && existing.length > 0) {
          return Response.json({ ok: true, skipped: true });
        }
      }
      await store.setJSON("posts", posts);
      return Response.json({ ok: true });
    } catch (e) {
      return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config = {
  path: "/api/posts",
};
