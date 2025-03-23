
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0ae3e1bd-a47a-4160-ad2b-073dbc89ddf7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0ae3e1bd-a47a-4160-ad2b-073dbc89ddf7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env.local file from the example template
cp .env.local.example .env.local
# Edit the .env.local file to add your Supabase credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Supabase Configuration

This project uses Supabase for backend services. You need to configure the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can add these to a `.env.local` file in the root of your project or set them directly in your environment.

### Important Setup Notes

1. **Create a Supabase Account**: Visit [Supabase](https://supabase.com/) and create an account if you don't have one.
2. **Create a New Project**: Set up a new project in Supabase.
3. **Get Your API Keys**: In your Supabase project dashboard, go to Project Settings → API to find your URL and anon key.
4. **Set Up Environment Variables**: Create a `.env.local` file in your project root directory and add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. **Initialize Database**: The application needs specific tables. You can use the SQL script in `supabase/migrations` to set up your database.

Without valid Supabase credentials, authentication and data features will not work properly.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0ae3e1bd-a47a-4160-ad2b-073dbc89ddf7) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
