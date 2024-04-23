
const fetchLinks = async () => {
    try {
      // Connect to your database.
      const client = await pool.connect();
  
      // Your modified SQL query to match the JSON schema.
      const sqlQuery = `
        SELECT
          id,
          title,
          content_summary,
          link_name AS link,
          uploaded_by AS username,
          upload_date AS timestamp,
          tags
        FROM links;
      `;
  
      // Execute the query.
      const res = await client.query(sqlQuery);
  
      // Transform the result set to match your JSON schema.
      const jsonData = res.rows.map(row => ({
        title: row.title,
        contentSummary: row.content_summary,
        link: row.link,
        username: row.username,
        timestamp: row.timestamp,
        tags: row.tags,
      }));
  
      // Always release the client back to the pool.
      client.release();
  
      // Here you can return the jsonData or handle it as needed.
      return jsonData;
    } catch (err) {
      console.error('Database query error', err.stack);
      return []; // Return an empty array or handle the error as appropriate.
    }
  };
  
  // Example usage
  fetchLinks().then(data => {
    console.log(data); // Output the transformed JSON data.
  }).catch(error => {
    console.error('Error fetching links', error);
  });
  