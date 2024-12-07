const BodySchema = v.object({
  endpoint: v.string(),
  keys: v.object({
    auth: v.string(),
    p256dh: v.string(),
  }),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validate(BodySchema));

  const storage = useStorage("db");

  await storage.setItem(`subscription:${body.keys.auth}`, body);

  setResponseStatus(event, 201);

  return { success: true };
});
