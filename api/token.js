import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

// 1. LiveKit सर्वर क्लाइंट सेटअप किया (मैचमेकिंग के लिए जरूरी)
const svc = new RoomServiceClient(
  process.env.LIVEKIT_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export default async function handler(req, res) {
  // आपकी पुरानी API Keys (सुरक्षित)
  const apiKey = process.env.LIVEKIT_API_KEY; 
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  // यूजर का नाम प्राप्त करना
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // 2. ऑटोमैटिक मैचमेकिंग लॉजिक
    // सभी एक्टिव रूम्स की लिस्ट निकालें
    const rooms = await svc.listRooms();
    
    // वो रूम ढूंढें जिसमें अभी सिर्फ 1 बंदा हो (ताकि 1-ऑन-1 कॉल बने)
    let targetRoom = rooms.find(r => r.numParticipants === 1);
    
    // अगर कोई खाली रूम नहीं है, तो नया रैंडम रूम आईडी बनाएं
    let roomName = targetRoom ? targetRoom.name : `room_${Math.random().toString(36).substring(7)}`;

    // 3. LiveKit टोकन जनरेट करना (पुराना लॉजिक सुरक्षित रखा)
    const at = new AccessToken(apiKey, apiSecret, { identity: username });
    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    
    // रिस्पॉन्स में टोकन और रूम का नाम वापस भेजें
    res.status(200).json({ token, room: roomName });
    
  } catch (error) {
    console.error("Matchmaking Error:", error);
    res.status(500).json({ error: 'Failed to connect to room' });
  }
}
