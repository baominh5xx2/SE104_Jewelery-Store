const Provider = require("../models/provider.model");

class ProviderService {
  static async getAllProviders() {
    return await Provider.findAll();
  }

  static async getProviderById(id) {
    return await Provider.findByPk(id);
  }

  static async createProvider(providerData) {
    return await Provider.create(providerData);
  }

  static async updateProvider(id, updatedData) {
    const provider = await Provider.findByPk(id);
    if (provider) {
      await provider.update(updatedData);
      return provider;
    }
    return null;
  }

  static async deleteProvider(id) {
    const provider = await Provider.findByPk(id);
    if (provider) {
      await provider.destroy();
      return true;
    }
    return false;
  }
}

module.exports = ProviderService;
