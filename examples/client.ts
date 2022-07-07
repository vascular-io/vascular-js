import Vascular from "../src";

const client = new Vascular("APP_KEY", "USER_ID");

async function main() {
  const inbox = await client.inbox({
    hwId: "1",
  });
}
