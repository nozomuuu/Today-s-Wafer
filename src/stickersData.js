const stickersData = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1;
  const googleDriveBaseUrl = 'https://drive.google.com/uc?id=';
  const stickerId = `sticker${id}`; // Replace with the actual ID logic if needed.

  return {
    id,
    image: `${googleDriveBaseUrl}${stickerId}`,
    isCollectible: true
  };
});

export default stickersData;
