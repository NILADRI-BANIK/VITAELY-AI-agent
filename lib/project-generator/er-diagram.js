import { generateERDiagram } from "./generator";
import { formatERDiagram } from "./formatter";

// ─── Get Full ER Diagram ──────────────────────────────────────────────────────
export const getERDiagram = async ({ title, description, coreFeatures }) => {
  const raw = await generateERDiagram({ title, description, coreFeatures });
  return formatERDiagram(raw);
};

// ─── Get Entity Names Only ────────────────────────────────────────────────────
export const getEntityNames = (erd = {}) => {
  if (!erd.entities || !Array.isArray(erd.entities)) return [];
  return erd.entities.map((entity) => entity.name);
};

// ─── Get Entity By Name ───────────────────────────────────────────────────────
export const getEntityByName = (erd = {}, name = "") => {
  if (!erd.entities || !Array.isArray(erd.entities)) return null;
  return (
    erd.entities.find(
      (entity) => entity.name?.toLowerCase() === name.toLowerCase(),
    ) || null
  );
};

// ─── Get Relationships For Entity ────────────────────────────────────────────
export const getRelationshipsForEntity = (erd = {}, entityName = "") => {
  if (!erd.relationships || !Array.isArray(erd.relationships)) return [];
  return erd.relationships.filter(
    (rel) =>
      rel.from?.toLowerCase() === entityName.toLowerCase() ||
      rel.to?.toLowerCase() === entityName.toLowerCase(),
  );
};

// ─── Get Primary Keys ─────────────────────────────────────────────────────────
export const getPrimaryKeys = (erd = {}) => {
  if (!erd.entities || !Array.isArray(erd.entities)) return [];
  return erd.entities.map((entity) => ({
    entity: entity.name,
    primaryKey:
      entity.attributes?.find((attr) =>
        attr.constraints?.toUpperCase().includes("PK"),
      ) || null,
  }));
};

// ─── Get Foreign Keys ─────────────────────────────────────────────────────────
export const getForeignKeys = (erd = {}) => {
  if (!erd.entities || !Array.isArray(erd.entities)) return [];
  const fkList = [];
  erd.entities.forEach((entity) => {
    const fks = (entity.attributes || []).filter((attr) =>
      attr.constraints?.toUpperCase().includes("FK"),
    );
    fks.forEach((fk) => {
      fkList.push({
        entity: entity.name,
        attribute: fk.name,
        type: fk.type,
        constraints: fk.constraints,
      });
    });
  });
  return fkList;
};

// ─── Convert ER Diagram to Mermaid Syntax ────────────────────────────────────
export const convertToMermaidSyntax = (erd = {}) => {
  if (!erd.entities || !Array.isArray(erd.entities)) return "";

  const lines = ["erDiagram"];

  erd.relationships?.forEach((rel) => {
    const typeMap = {
      "one-to-one": "||--||",
      "one-to-many": "||--o{",
      "many-to-many": "}o--o{",
    };
    const connector = typeMap[rel.type] || "||--o{";
    lines.push(
      `  ${rel.from} ${connector} ${rel.to} : "${rel.label || "relates to"}"`,
    );
  });

  erd.entities?.forEach((entity) => {
    lines.push(`  ${entity.name} {`);
    entity.attributes?.forEach((attr) => {
      lines.push(`    ${attr.type} ${attr.name}`);
    });
    lines.push("  }");
  });

  return lines.join("\n");
};

// ─── Get ER Diagram Summary ───────────────────────────────────────────────────
export const getERDiagramSummary = (erd = {}) => {
  return {
    totalEntities: erd.entities?.length || 0,
    totalRelationships: erd.relationships?.length || 0,
    totalAttributes:
      erd.entities?.reduce(
        (acc, entity) => acc + (entity.attributes?.length || 0),
        0,
      ) || 0,
    notes: erd.notes || [],
    mermaidSyntax: convertToMermaidSyntax(erd),
  };
};
