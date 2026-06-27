import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // यह कोड आपकी API keys को सुरक्षित तरीके से पढ़ेगा
  const apiKey = process.env.LIVEKIT_API_KEY; 
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  // यूजर से रूम का नाम और नाम मांग रहा है
  const { room, username } = req.query;

  if (!room || !username) {
    return res.status(400).json({ error: 'Room and username are required' });
  }

  // टोकन बनाना
  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  at.addGrant({ roomJoin: true, room: room });

  const token = await at.toJwt();
  
  res.status(200).json({ token });
}
