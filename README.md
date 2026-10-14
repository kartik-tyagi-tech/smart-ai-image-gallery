# Smart AI Image Gallery — local setup

## One-time setup

1. Install Azure Functions Core Tools v4 using the official Windows installer from Microsoft.
   The npm installer is not compatible with Node.js 24, which is installed on this computer.
   After installing, close and reopen PowerShell, then check it worked:

   ```powershell
   func --version
   ```

2. Install the backend packages:

   ```powershell
   cd "gallery-functions-main"
   npm install
   ```

3. Copy `gallery-functions-main/local.settings.example.json` to a new file called
   `gallery-functions-main/local.settings.json`. Fill in your Azure Storage, Cosmos DB,
   and Azure AI Vision values. Keep this file private.

4. Fill in your Storage account URL and a fresh SAS token in
   `imageGallery-main/config.js`. The SAS token needs Create, Write, and Read permissions
   for the `images` container.

## Run locally

Open two PowerShell windows.

**Window 1 — backend**

```powershell
cd "gallery-functions-main"
npm start
```

**Window 2 — frontend**

```powershell
cd "imageGallery-main"
npx serve .
```

Open the local address displayed by `serve` (usually `http://localhost:3000`).

## Required Azure configuration

- Storage account: create a Blob container called `images`.
- Cosmos DB: create the database/container named in `local.settings.json`; configure the
  container partition key as `/album`.
- Azure AI Vision: enter its endpoint and key.
- The Storage connection string and the frontend SAS token must refer to the same storage account.
