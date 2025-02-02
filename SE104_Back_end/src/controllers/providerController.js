const ProviderService = require("../services/providerService");

class ProviderController {
  static async getAllProviders(req, res) {
    try {
      const providers = await ProviderService.getAllProviders();
      res.status(200).json(providers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProviderById(req, res) {
    try {
      const { id } = req.params;
      const provider = await ProviderService.getProviderById(id);
      if (provider) {
        res.status(200).json(provider);
      } else {
        res.status(404).json({ message: "Provider not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createProvider(req, res) {
    try {
      const newProvider = req.body;
      const createdProvider = await ProviderService.createProvider(newProvider);
      res.status(201).json(createdProvider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProvider(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedProvider = await ProviderService.updateProvider(
        id,
        updatedData
      );
      if (updatedProvider) {
        res.status(200).json(updatedProvider);
      } else {
        res.status(404).json({ message: "Provider not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteProvider(req, res) {
    try {
      const { id } = req.params;
      const result = await ProviderService.deleteProvider(id);
      if (result) {
        res.status(200).json({ message: "Provider deleted successfully" });
      } else {
        res.status(404).json({ message: "Provider not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProviderController;
