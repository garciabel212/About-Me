/**
 * City — assembles all buildings from cityData configuration.
 *
 * Single responsibility: iterate SKYLINE_BUILDINGS data → Building components.
 * The SystemsTower is rendered separately (from BrickellScene) so it can be
 * given dedicated treatment in future milestones.
 */
import Building from './Building';
import { SKYLINE_BUILDINGS, GROUND_CONFIG } from './cityData';
import { MAT } from './materials';

export default function City() {
  const [gx, gy, gz] = GROUND_CONFIG.position;
  const [gw, gh, gd] = GROUND_CONFIG.dimensions;

  return (
    <group name="city">
      {/* Ground plane — dark urban pavement */}
      <mesh
        name="ground"
        position={[gx, gy, gz]}
        receiveShadow
        material={MAT.CONCRETE_DARK}
      >
        <boxGeometry args={[gw, gh, gd]} />
      </mesh>

      {/* All skyline buildings driven by config data */}
      {SKYLINE_BUILDINGS.map((cfg) => (
        <Building key={cfg.id} config={cfg} />
      ))}
    </group>
  );
}
