const GeneratorFactoryContract = artifacts.require('GeneratorFactoryContract');

module.exports = async function (deployer) {
  await deployer.deploy(GeneratorFactoryContract);
};
