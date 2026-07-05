export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    const { mimeType, base64Image } = req.body;
    
    // Mengambil API Key dari Environment Variable Vercel (Aman!)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key belum diset di Dashboard Vercel!' });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        const respons = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Berikan HANYA SATU kalimat caption pendek yang sangat estetik, puitis, atau lucu dalam bahasa Indonesia untuk foto ini. JANGAN berikan pilihan, JANGAN pakai hashtag, dan JANGAN ada kata pembuka. LANGSUNG tulis caption-nya saja!" },
                        { inlineData: { mimeType: mimeType, data: base64Image } }
                    ]
                }]
            })
        });

        const data = await respons.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        const teksAI = data.candidates[0].content.parts[0].text.trim();
        return res.status(200).json({ caption: teksAI });

    } catch (error) {
        return res.status(500).json({ error: 'Gagal menghubungi server Gemini: ' + error.message });
    }
}
