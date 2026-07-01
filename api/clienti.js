import { clienti } from "../src/db/schema.js";
import { createCrudHandler } from "./_utils.js";
import { notifyClientNou } from "./_email.js";

export default createCrudHandler(clienti, {
  onCreate: (client, orgId, userName) => {
    notifyClientNou(client, orgId, userName);
  },
});
