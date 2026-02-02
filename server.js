const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// In-memory storage for survey responses
let surveyResponses = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all survey responses
app.get('/api/responses', (req, res) => {
  console.log('📊 Fetching all responses...');
  res.json({
    total: surveyResponses.length,
    responses: surveyResponses
  });
});

// Submit a new survey response
app.post('/api/submit', (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating) {
    return res.status(400).json({ error: 'Name and rating are required' });
  }

  const response = {
    id: Date.now(),
    name,
    rating: parseInt(rating),
    comment: comment || '',
    timestamp: new Date().toISOString()
  };

  surveyResponses.push(response);

  console.log('✅ New survey response received:');
  console.log(`   Name: ${name}`);
  console.log(`   Rating: ${rating}/5`);
  console.log(`   Comment: ${comment || 'No comment'}`);
  console.log(`   Total responses: ${surveyResponses.length}`);
  console.log('---');

  res.json({
    success: true,
    message: 'Survey response recorded',
    response
  });
});

// Get survey statistics
app.get('/api/stats', (req, res) => {
  if (surveyResponses.length === 0) {
    return res.json({
      total: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  }

  const totalRating = surveyResponses.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = (totalRating / surveyResponses.length).toFixed(2);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  surveyResponses.forEach(r => {
    distribution[r.rating]++;
  });

  res.json({
    total: surveyResponses.length,
    averageRating: parseFloat(averageRating),
    distribution
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 Course Satisfaction Survey Application');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('💾 Using in-memory storage (data will be lost on restart)');
  console.log('---');
});
