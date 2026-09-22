/** @typedef {"rIn" | "e" | "rBall" | "hSep"} HarmonicBase */
/**
 * @typedef {object} HarmonicDriveProps
 * @prop {number} thickness Thickness of separator
 * @prop {number} zBalls Number of rolling elements
 * @prop {number} zWaves Number of waves
 * @prop {number} rOuter Outer radius of drive
 * @prop {number} sepOffset Offset of separator
 * @prop {HarmonicBase} baseProp Name of base property
 * @prop {number} baseValue Value of base property
 */
/**
 * @typedef {object} HarmonicDriveDependentProps
 * @prop {number} rIn Inner profile radius
 * @prop {number} e Eccentricity
 * @prop {number} rBall Radius of rolling body (default)
 * @prop {number} hSep Thickness of separator
 * @prop {number} zHard Number of waves of outer wheel
 * @prop {number} rDisk Radius of wave generator
 * @prop {string | null} error
 */
const __app_harmonicDrive = mod(async () => {
  const { Vec2, Mat2d } = await __utils_glMatrix();
  const { approximate } = await __utils_approxBezier();
  const { roundTo } = await __utils();
  const { asin, atan2, sin, cos, sqrt, pow, PI } = Math;
  const t = __i18n();

  /** @param {HarmonicDriveProps} props @returns {HarmonicDriveDependentProps}  */
  const calcDependentProperties = (props) => {
    const { rOuter, sepOffset, baseValue, baseProp } = props;
    /** Potentially this is also a property >= 1. This property works as smoothing factor for profile */
    const ballFromE = 2.5;
    const sepConst = ballFromE - 2 * sepOffset;
    let rIn = 0,
      e = 0,
      rBall = 0,
      hSep = 0,
      /** @type {string | null} */ error = null;

    switch (baseProp) {
      case "rIn":
        rIn = baseValue;
        e = (rOuter - baseValue) / 2;
        rBall = (ballFromE * (rOuter - baseValue)) / 2;
        hSep = (sepConst * (rOuter - baseValue)) / 2;
        break;
      case "e":
        rIn = rOuter - baseValue * 2;
        e = baseValue;
        rBall = ballFromE * baseValue;
        hSep = sepConst * baseValue;
        break;
      case "rBall":
        rIn = rOuter - (baseValue / ballFromE) * 2;
        e = baseValue / ballFromE;
        rBall = baseValue;
        hSep = (sepConst * baseValue) / ballFromE;
        break;
      case "hSep":
        rIn = rOuter - (baseValue / sepConst) * 2;
        e = baseValue / sepConst;
        rBall = (ballFromE * baseValue) / sepConst;
        hSep = baseValue;
        break;
      default:
        error = t.errUnknownBase();
    }

    const zHard = props.zBalls + props.zWaves;
    const rDisk = rIn + e - 2 * rBall;

    if (rIn < (1.03 * (2 * rBall)) / sin(PI / zHard)) {
      error = t.errImpossible();
    }
    return { rIn, e, rBall, hSep, zHard, rDisk, error };
  };

  /**
   * Rolling element distance to center
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const l = (phi, z, rSq, e) => e * cos(z * phi) + S(phi, z, rSq, e);

  /**
   * Angle to contact point of rolling element
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const chi = (phi, z, rSq, e) => atan2(e * z * sin(z * phi), S(phi, z, rSq, e));

  /**
   * Basic wave profile in polar coordinates
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const S = (phi, z, rSq, e) => sqrt(rSq - pow(e * sin(z * phi), 2));
  /** @typedef {'inner' | 'outer'} ProfileSide */

  /**
   * @param {number} phi
   * @param {number} z
   * @param {ProfileSide} side
   * @param {number} rBall
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   * @returns {Vec2Like}
   */
  const evalWavePoint = (phi, z, side, rBall, rSq, e) => {
    const dist = l(phi, z, rSq, e);
    const phase = phi + chi(phi, z, rSq, e);
    if (side === "outer") return [dist * cos(phi) + rBall * cos(phase), dist * sin(phi) + rBall * sin(phase)];
    return [dist * cos(phi) - rBall * cos(phase), dist * sin(phi) - rBall * sin(phase)];
  };

  /** @param {Vec2Like} result @param {Vec2Like} v */
  const rotateCCW = (result, v) => {
    const x = v[0];
    result[0] = -v[1];
    result[1] = x;
    return result;
  };

  /** @param {Vec2Like} pt */
  const roundPt = ([x, y]) => `${roundTo(x, 6)},${roundTo(y, 6)}`;

  /**
   * @param {number} waves
   * @param {number} pointsPerHalfWave
   * @param {HarmonicDriveDependentProps} props
   * @param {ProfileSide} [side="outer"]
   * @param {number} [approx=0]
   * @param {number} [samples=16]
   * @returns
   */
  const harmonicProfile = (waves, pointsPerHalfWave, props, side = "outer", approx = 0, samples = 16) => {
    const { rBall, rDisk, e } = props;
    const rSq = pow(rBall + rDisk, 2);
    const halfWaves = 2 * waves;
    const points = pointsPerHalfWave * halfWaves;

    let lastPoint = evalWavePoint(0, waves, side, rBall, rSq, e);
    const firstPoint = lastPoint;

    let path = `M${roundPt(lastPoint)}`;
    if (approx) {
      const pathPts = [lastPoint];

      const tangent1 = Vec2.normalize([0, 0], lastPoint);
      rotateCCW(tangent1, tangent1);

      for (let i = 1; i <= pointsPerHalfWave; ++i) {
        lastPoint = evalWavePoint((i * 2 * PI) / points, waves, side, rBall, rSq, e);
        pathPts.push(lastPoint);
      }

      const tmp = Vec2.normalize([0, 0], lastPoint);
      rotateCCW(tmp, tmp);

      /** @type {Vec2Like[]} */
      const bez = approximate(pathPts, { adjustSteps: approx, samplingPoints: samples, tangent1, tangent2: tmp });
      bez.unshift(
        ...bez
          .map(([x, y]) => Vec2.create(x, -y))
          .reverse()
          .slice(0, -1),
      );

      path = `M${roundPt(bez[0])}C`;
      bez.shift();

      /** @type {Mat2dLike} */
      const rot = [1, 0, 0, 1, 0, 0];
      for (let i = 0; i < waves; ++i) {
        Mat2d.fromRotation(rot, (PI * 2 * i) / waves);
        path += ` ${bez.map((pt) => roundPt(Vec2.transformMat2d(tmp, pt, rot))).join(" ")}`;
      }
    } else {
      for (let halfWave = 0; halfWave < halfWaves; ++halfWave) {
        const offset = halfWave * pointsPerHalfWave;
        const pathPts = [lastPoint];
        for (let i = 1; i <= pointsPerHalfWave; ++i) {
          lastPoint = evalWavePoint(((i + offset) * 2 * PI) / points, waves, side, rBall, rSq, e);
          pathPts.push(lastPoint);
        }
        if (halfWave + 1 >= halfWaves) {
          Vec2.copy(lastPoint, firstPoint);
        }
        path += ` ${pathPts.map(roundPt).join(" ")}`;
      }
    }
    path += "Z";
    return path;
  };

  /**
   * @param {number} zBalls
   * @param {number} rDisk
   * @param {number} rBall
   * @param {number} hSep
   */
  const separatorProfile = (zBalls, rDisk, rBall, hSep) => {
    let path = "";
    const midR = rDisk + rBall;
    const outR = midR + 0.5 * hSep;
    const inR = midR - 0.5 * hSep;

    const outAngle = asin(rBall / outR);
    const inAngle = asin(rBall / inR);
    const large = Number(zBalls == 1);
    for (let i = 0; i < zBalls; ++i) {
      const alpha = (i / zBalls) * 2 * PI;
      const beta = ((i + 1) / zBalls) * 2 * PI;

      const leftOut = Vec2.create(outR * cos(alpha + outAngle), outR * sin(alpha + outAngle));
      const rightOut = Vec2.create(outR * cos(beta - outAngle), outR * sin(beta - outAngle));
      const leftIn = Vec2.create(inR * cos(alpha + inAngle), inR * sin(alpha + inAngle));
      const rightIn = Vec2.create(inR * cos(beta - inAngle), inR * sin(beta - inAngle));

      path +=
        `M${roundPt(leftOut)}A ${roundTo(outR, 6)} ${roundTo(outR, 6)} 0 ${large}1${roundPt(rightOut)}` +
        `L${roundPt(rightIn)}A ${roundTo(inR, 6)} ${roundTo(inR, 6)} 0 ${large}0${roundPt(leftIn)}Z`;
    }

    return path;
  };

  /**
   * @param {number} phi
   * @param {number} zBalls
   * @param {HarmonicDriveDependentProps} props
   */
  const ballPositions = (phi, zBalls, props) => {
    const { rBall, rDisk, e, zHard } = props;
    const rSq = pow(rBall + rDisk, 2);

    /** @type {Vec2Like[]} */
    const result = [];
    for (let i = 0; i < zBalls; ++i) {
      const phiBall = (PI * 2 * i) / zBalls + phi;
      const R = l(phiBall, zHard, rSq, e);
      result.push([roundTo(R * cos(phiBall), 6), roundTo(R * sin(phiBall), 6)]);
    }
    return result;
  };

  /**
   * @param {HarmonicDriveProps} props
   * @param {object} [approx]
   * @param {number} [approx.points] Points per half wave (for precise profile)
   * @param {number} [approx.samples] Sample points of approximation with curves
   * @param {number} [approx.steps] Steps of approximation with curves (<= 0 — no approximation)
   */
  const buildHarmonicDrive = (props, { steps = 0, samples = 16, points = 32 } = {}) => {
    const deps = calcDependentProperties(props);
    if (deps.error) {
      throw new Error(deps.error);
    }

    const { e, rDisk } = deps;

    const hardOuter = props.rOuter + props.thickness;
    const wheelProfile = harmonicProfile(deps.zHard, points, deps, "outer", steps, samples);
    const hardWheel = `M${roundTo(hardOuter, 6)},0A 1 1 0 00${-roundTo(hardOuter, 6)} 0 1 1 0 00${roundTo(hardOuter, 6)} 0z${wheelProfile}`;
    const waveGenerator =
      props.zWaves <= 1
        ? `M${e + rDisk},0a${rDisk} ${rDisk} 0 00${-2 * rDisk} 0 ${rDisk} ${rDisk} 0 00${2 * rDisk} 0z`
        : harmonicProfile(props.zWaves, points, deps, "inner", steps, samples);
    const separator = separatorProfile(props.zBalls, deps.rDisk, deps.rBall, deps.hSep);

    return { hardWheel, waveGenerator, separator, rBall: deps.rBall, balls: ballPositions(0, props.zBalls, deps) };
  };

  return { buildHarmonicDrive, ballPositions, calcDependentProperties };
});
