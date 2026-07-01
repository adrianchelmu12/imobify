import { programari } from "../src/db/schema.js";
import { createCrudHandler } from "./_utils.js";
import { notifyProgramareNoua, notifyProgramareActualizata } from "./_email.js";

export default createCrudHandler(programari, {
  onCreate: (p, orgId, userName) => {
    notifyProgramareNoua(p, orgId, userName);
  },
  onUpdate: (p, orgId, userName) => {
    if (p.status) {
      notifyProgramareActualizata(p, orgId, userName);
    }
  },
});
