"use server"

export async function fetchNewsHtml(): Promise<string> {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>News</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <main class="bg-white rounded-lg shadow-md p-8 max-w-xl w-full">
      <h1 class="text-3xl font-bold mb-4 text-blue-600">News</h1>
      <p class="text-gray-700 text-base">
        This is a simple news page created using TailwindCSS. Replace this content with your latest articles or updates.
      </p>
    </main>
  </body>
</html>
`.trim()
}
