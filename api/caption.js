export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    const { mimeType, base64Image } = req.body;
    
    // INI KUNCI FIX-NYA: Membersihkan embel-embel "data:image/jpeg;base64,"
    const pureBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key belum diset di Dashboard Vercel!' });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    try {
        const respons = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Berikan HANYA SATU kalimat caption pendek yang sangat estetik, puitis, atau lucu dalam bahasa Indonesia untuk foto ini. JANGAN berikan pilihan, JANGAN pakai hashtag, dan JANGAN ada kata pembuka. LANGSUNG tulis caption-nya saja!" },
                        { inlineData: { mimeType: mimeType, data: pureBase64 } } // <-- Pakai teks yang sudah bersih
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
