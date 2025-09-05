export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests allowed' });
    }

    try {
        const { fileName, filePath, content } = request.body;
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Lese den geheimen Token aus den Umgebungsvariablen

        if (!GITHUB_TOKEN) {
            return response.status(500).json({ message: 'GitHub Token is not configured.' });
        }

        const repoOwner = 'CodingNevnex';
        const repoName = 'image-uploader';
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
        
        let sha = null;
        // Überprüfe, ob die Datei bereits existiert
        const checkResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
            },
        });

        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha;
        }

        const uploadBody = {
            message: `Upload ${fileName}`,
            content: content,
            sha: sha,
        };

        const uploadResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadBody),
        });

        if (uploadResponse.ok) {
            return response.status(200).json({ message: 'Upload successful' });
        } else {
            const error = await uploadResponse.json();
            return response.status(uploadResponse.status).json({ message: error.message });
        }
    } catch (error) {
        return response.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
