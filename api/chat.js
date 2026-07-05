export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    const { pesan, base64Image, mimeType } = req.body;
    const pureBase64 = base64Image?.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) return res.status(500).json({ error: 'API Key belum diset!' });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    // INI DIA OTAK KARAKTERNYA: Kamu bisa ganti kata-katanya kalau mau lebih/kurang julid!
    const instruksiKarakter = "Kamu adalah teman nongkrong yang super julid, sarkas, blak-blakan, tapi asik dan lucu. Gunakan bahasa gaul Jakarta (lo/gue). Tugasmu adalah membalas chat pengunjung yang sedang melihat sebuah foto. Roasting fotonya atau balas pertanyaannya dengan pedas tapi bikin ngakak. Jangan panjang-panjang, maksimal 2-3 kalimat aja.";
    
    const kontenPesan = instruksiKarakter + "\n\nChat pengunjung: " + pesan;

    let parts = [{ text: kontenPesan }];
    
    // Kalau ada fotonya, kita masukin fotonya juga biar AI bisa lihat
    if (pureBase64) {
        parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: pureBase64 } });
    }

    try {
        const respons = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });

        const data = await respons.json();
        if (!respons.ok || data.error) throw new Error(data.error?.message);

        const balasanAI = data.candidates[0].content.parts[0].text.trim();
        return res.status(200).json({ balasan: balasanAI });

    } catch (error) {
        return res.status(500).json({ error: 'Gagal mikir: ' + error.message });
    }
}
