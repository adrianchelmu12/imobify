import { proiecte } from "../src/db/schema.js";
import { createCrudHandler } from "./_utils.js";

export default createCrudHandler(proiecte);
