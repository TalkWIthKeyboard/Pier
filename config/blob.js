const azure = require('azure-storage');
const blobConfig = {
  accout: 'shipping',
  key: 'bp6+W2ADYHsxQ04zPBUurHhV4HJ06B0Pud0cv9rbVmaULd1/gAJp+VHoJki/4lwvhMuF3GiN/D+2LLGzCP3G7g=='
};

let blobService = azure.createBlobService(blobConfig.accout, blobConfig.key);

module.exports = blobService;
