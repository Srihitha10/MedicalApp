const truffleContract = require("@truffle/contract");
const MedicalRecords = truffleContract(
  require("../build/contracts/MedicalRecords.json")
);

module.exports = function (deployer) {
  deployer.deploy(MedicalRecords);
};
