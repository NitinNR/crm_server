async function* getDataChunks() {
    let offset = 0;
    const chunkSize = 20;
    let hasMoreData = true;
  
    while (hasMoreData) {
      // Fetch data from the database using an asynchronous operation
      const dataChunk = await fetchDataFromDatabase(offset, chunkSize);
  
      if (dataChunk.length > 0) {
        console.log("yeilding")
        yield dataChunk;
        offset += chunkSize;
      } else {
        hasMoreData = false;
      }
    }
  }
  
  // Example asynchronous function to fetch data from the database
  async function fetchDataFromDatabase(offset, limit) {
    // Implement your database query logic here
    // Use offset and limit for pagination or chunking
  
    // Simulating fetching data with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Return the fetched data
    return ['data1', 'data2', 'data3']; // Replace with actual database query result
  }
  
  // Usage example
  async function fetchAllData() {
    for await (const dataChunk of getDataChunks()) {
      // Process the data chunk
      console.log('Received data chunk:', dataChunk);
    }
  
    console.log('All data fetched');
  }
  
  fetchAllData();
  