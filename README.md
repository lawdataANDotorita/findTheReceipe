# Recipe Finder - AI Dish Recognition

An AI-powered web application that analyzes images of dishes and generates detailed recipes using OpenAI's GPT-4o-mini vision model.

## Features

- Upload or drag-and-drop dish images
- AI-powered recipe generation with:
  - Dish name identification
  - Complete ingredient list with measurements
  - Step-by-step cooking instructions
  - Preparation and cooking time estimates
  - Serving size information
- Beautiful, responsive UI
- Secure serverless API integration

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Netlify Serverless Functions (Node.js)
- **AI**: OpenAI GPT-4o-mini with Vision
- **Deployment**: Netlify

## Project Structure

```
findTheReceipe/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Client-side JavaScript
├── netlify.toml           # Netlify configuration
├── netlify/
│   └── functions/
│       └── analyze-recipe.js  # Serverless function for OpenAI API
└── README.md              # This file
```

## Setup and Deployment

### Prerequisites

- A Netlify account
- An OpenAI API key

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy and save your API key securely

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard

1. Push this repository to GitHub
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub repository
5. Configure build settings:
   - **Build command**: Leave empty
   - **Publish directory**: `.` (current directory)
   - **Functions directory**: `netlify/functions`
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Step 3: Set Environment Variable

1. In your Netlify site dashboard, go to **Site settings** > **Environment variables**
2. Click **Add a variable**
3. Add the following:
   - **Key**: `OPENAI_KEY`
   - **Value**: Your OpenAI API key
4. Click **Save**

**Important**: The serverless function expects the environment variable to be named `OPENAI_KEY` as you specified.

### Step 4: Redeploy (if needed)

If you added the environment variable after deployment, trigger a redeploy:
- Go to **Deploys** tab
- Click **Trigger deploy** > **Deploy site**

## Usage

1. Visit your deployed Netlify site URL
2. Click the upload area or drag and drop an image of a dish
3. Click "Analyze Dish"
4. Wait for the AI to generate the recipe
5. View your complete recipe with ingredients and instructions!

## Supported Image Formats

- PNG
- JPG/JPEG
- WEBP
- Maximum file size: 4MB

## Development

To test locally:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Set up environment variable locally:
   ```bash
   # Create .env file
   echo "OPENAI_KEY=your_api_key_here" > .env
   ```

3. Run local development server:
   ```bash
   netlify dev
   ```

4. Open `http://localhost:8888` in your browser

## API Costs

This app uses OpenAI's GPT-4o-mini model, which is cost-effective:
- Vision capabilities included
- Typical cost per recipe: ~$0.01-0.02
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Troubleshooting

### "OpenAI API key not configured" error
- Ensure you've added the `OPENAI_KEY` environment variable in Netlify
- Verify the variable name is exactly `OPENAI_KEY`
- Redeploy your site after adding the variable

### Image upload fails
- Check image size (must be under 4MB)
- Verify image format (PNG, JPG, WEBP)

### Recipe generation is slow
- This is normal - vision model processing takes 5-15 seconds
- Larger images may take longer to process

## Security

- API key is stored securely as an environment variable
- Never exposed to client-side code
- All API calls go through secure Netlify serverless function
- CORS and security headers configured

## License

MIT License - feel free to use and modify for your projects!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
