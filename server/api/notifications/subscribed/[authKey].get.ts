const ParamsSchema = v.object({
  authKey: v.string(),
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, validate(ParamsSchema));

  const storage = useStorage('db');

  return storage.hasItem(`subscription:${params.authKey}`);
});
