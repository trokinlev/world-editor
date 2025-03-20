import { Float32BufferAttribute, Vector3, type BufferGeometry } from "three";
import { Square } from "./square";

interface GeometryProps {
  top?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  front?: boolean;
  back?: boolean;
}

export class Block {
  private static readonly TILE_SIZE = 16;
  private static readonly ATLAS_SIZE = 32;

  constructor(
    public position: Vector3,
    public textureCoords: { x: number; y: number }
  ) {}

  geometry(props: GeometryProps): BufferGeometry[] {
    return (Object.keys(props) as (keyof GeometryProps)[])
      .filter((side) => props[side])
      .map((side) => {
        const geom = Square.side(side);
        geom.translate(this.position.x, this.position.y, this.position.z);
        this.applyTexture(geom, side);
        return geom;
      });
  }

  private applyTexture(geom: BufferGeometry, side: string) {
    const uvs = this.calculateUVs(side);
    geom.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  }

  private calculateUVs(side: string) {
    const uScale = Block.TILE_SIZE / Block.ATLAS_SIZE;
    const vScale = Block.TILE_SIZE / Block.ATLAS_SIZE;

    const uOffset = this.textureCoords.x * uScale;
    const vOffset = 1 - (this.textureCoords.y + 1) * vScale + vScale;

    return Square.sideUVs(side).map((val, idx) => {
      return idx % 2 === 0 ? val * uScale + uOffset : val * vScale + vOffset;
    });
  }
}