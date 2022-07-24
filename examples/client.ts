// polyfilling 
global.XMLHttpRequest = require('xhr2');

import Vascular, { Language } from "../src";

const client = new Vascular("<app-key>", "<user-id>", [Language.ENUK, Language.ENUS, Language.NB]);

async function main() {
  try {
    const inbox = await client.inbox();
    console.log(inbox);
  } catch (e) {
    console.log("ERROR: ", e);
  }
}

main();