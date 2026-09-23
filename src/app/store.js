const __app_store = mod.sync(() => {
  const { $state } = __jsx();

  const props = {
    thickness: $state(1),
    zBalls: $state(8),
    zWaves: $state(1),
    rOuter: $state(10),
    sepOffset: $state(0.15),
    baseProp: $state(/** @type {HarmonicBase} */ ("rBall")),
    baseValue: $state(1),
  };

  const getProps = () => ({
    thickness: props.thickness(),
    zBalls: props.zBalls(),
    zWaves: props.zWaves(),
    rOuter: props.rOuter(),
    sepOffset: props.sepOffset(),
    baseProp: props.baseProp(),
    baseValue: props.baseValue(),
  });

  const animation = $state(false);
  const rpm = $state(60);

  return {
    props,
    getProps,
    animation,
    rpm,
  };
});
