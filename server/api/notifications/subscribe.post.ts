const BodySchema = v.object({
  endpoint: v.string(),
  keys: v.object({
    auth: v.string(),
    p256dh: v.string(),
  }),
});

const validate = (data: unknown) => v.parse(BodySchema, data);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validate);

  const storage = useStorage('db');

  await storage.setItem(`subscription:${body.keys.auth}`, body);

  setResponseStatus(event, 201);

  return { success: true };
});
