const ParamsSchema = v.object({
  authKey: v.string(),
});

const validate = (data: unknown) => v.parse(ParamsSchema, data);

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, validate);

  const storage = useStorage('db');

  return storage.hasItem(`subscription:${params.authKey}`);
});
