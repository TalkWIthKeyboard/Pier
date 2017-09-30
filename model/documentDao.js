class DocDao {
  constructor(documentDBClient, databaseId, collectionId) {
    this.client = documentDBClient;
    this.databaseId = databaseId;
    this.collectionId = collectionId;
    this.collectionUrl = `dbs/${this.databaseId}/colls/${this.collectionId}`;
  }

  find(id) {
    let querySpec = {
      query: 'SELECT * FROM root r WHERE r.id= @id',
      parameters: [{
        name: '@id',
        value: id
      }]
    };

    return new Promise((resolve, reject) => {
      this.client.queryDocuments(this.collectionUrl, querySpec).toArray((err, results) => {
        err ? reject(err) : resolve(results);
      });
    });
  }

  getTestRunFileNameByEnv(env) {
    let querySpec = {
      query: 'SELECT r.TestRun.fileFullName FROM root r WHERE r.TestRun.env= @env',
      parameters: [{
        name: '@env',
        value: env
      }]
    };

    return new Promise((resolve, reject) => {
      this.client.queryDocuments(this.collectionUrl, querySpec).toArray((err, results) => {
        err ? reject(err) : resolve(results);
      });
    });
  }

  addItem(item) {
    return new Promise((resolve, reject) => {
      this.client.createDocument(this.collectionUrl, item, (err, doc) => {
        err ? reject(err) : resolve(doc);
      });
    });
  }
}

module.exports = DocDao;
