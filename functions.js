export default {
  async fetch(request) {
    return Response.json({
      ok: true,
      name: "pg-atticfind",
      path: new URL(request.url).pathname,
    });
  },
};
