import { config } from '../config/env.js';
import logger from '../config/logger.js';

async function listModels() {
  try {
    const apiKey = config.gemini.apiKey;
    if (!apiKey) {
        console.error("No API KEY found in config");
        return;
    }
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log(`Fetching models from: ${url.replace(apiKey, 'HIDDEN')}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.error("Error fetching models:", data);
        return;
    }

    console.log("Available Models:");
    if (data.models) {
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods})`);
        });
    } else {
        console.log("No models returned", data);
    }

  } catch (error) {
    console.error("Script failed:", error);
  }
}

listModels();
