import { taskuri } from "../src/db/schema.js";
import { createCrudHandler } from "./_utils.js";

export default createCrudHandler(taskuri);
