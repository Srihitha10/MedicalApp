import { create } from "ipfs-http-client";

const projectId = "YOUR_INFURA_PROJECT_ID"; // Get from infura.io
const projectSecret = "YOUR_INFURA_SECRET"; // Get from infura.io

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default client;
