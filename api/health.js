export default function handler(req, res) {
  res.json({
    ok: true,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasClerkKey: !!process.env.CLERK_SECRET_KEY,
  });
}
