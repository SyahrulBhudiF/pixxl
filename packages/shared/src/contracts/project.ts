import { Schema } from "effect";
import { oc } from "@orpc/contract";
import {
  CreateProjectInputSchema,
  ListProjectsInputSchema,
  ProjectMetadataListSchema,
  ProjectMetadataSchema,
} from "../schema/project";

export const createProjectContract = oc
  .input(Schema.toStandardSchemaV1(CreateProjectInputSchema))
  .output(Schema.toStandardSchemaV1(ProjectMetadataSchema));

export const listProjectsContract = oc
  .input(Schema.toStandardSchemaV1(ListProjectsInputSchema))
  .output(Schema.toStandardSchemaV1(ProjectMetadataListSchema));
