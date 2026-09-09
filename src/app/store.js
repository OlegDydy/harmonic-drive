const __app_store = mod(async () => {
  const { $state } = await __jsx();

  return {
    props: {
      thickness: $state(1),
      zBalls: $state(8),
      zWaves: $state(1),
      rOuter: $state(10),
      sepOffset: $state(0.15),
      baseProp: $state(/** @type {HarmonicBase} */("rBall")),
      baseValue: $state(1),
    }
  };
});
