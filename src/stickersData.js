const fetchStickers = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/stickers');
        if (!response.ok) throw new Error('Failed to fetch stickers');
        const stickers = await response.json();
        return stickers.map(sticker => ({
            image: sticker.link,
            isCollectible: true,
        }));
    } catch (error) {
        console.error('Error fetching stickers:', error.message);
        return [];
    }
};

export default fetchStickers;
