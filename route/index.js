app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  const cacheKey = `user:${id}`;

  const cachedUser = await redisClient.get(cacheKey);

  if (cachedUser) {
    console.log("CACHE HIT");

    return res.json({
      source: "redis",
      data: JSON.parse(cachedUser),
    });
  }

  console.log("CACHE MISS");

  const user = await User.findById(id);

  await redisClient.set(cacheKey, JSON.stringify(user), {
    EX: 60,
  });

  return res.json({
    source: "mongodb",
    data: user,
  });
});
